import { expect, test } from '@playwright/test'

test.describe('Dynamic Permissions Matrix API Regression', () => {
  let requestContext: any
  let adminToken: string
  let userId: string
  let roleId: string
  let projectId: string
  let testerToken: string

  test.beforeAll(async ({ playwright }) => {
    requestContext = await playwright.request.newContext()

    // 1. Log in as Admin to obtain access token
    const loginResponse = await requestContext.post('http://localhost:3001/api/v1/auth/login', {
      data: {
        loginName: 'admin',
        password: 'admin123'
      }
    })
    expect(loginResponse.ok()).toBe(true)
    const loginData = await loginResponse.json()
    adminToken = loginData.data.tokens.accessToken

    // 2. Fetch default Project "TMTT" details
    const projectsResponse = await requestContext.get('http://localhost:3001/api/v1/projects', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect(projectsResponse.ok()).toBe(true)
    const projectsBody = await projectsResponse.json()
    const targetProject = (projectsBody.data.projects || projectsBody.data).find((p: any) => p.abbreviation === 'TMTT')
    if (!targetProject) {
      console.log('PROJECTS RESPONSE SHAPE:', JSON.stringify(projectsBody, null, 2))
    }
    expect(targetProject).toBeDefined()
    projectId = targetProject.id

    // 3. Find or Create Dynamic Regression Role
    const rolesResponse = await requestContext.get('http://localhost:3001/api/v1/roles', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect(rolesResponse.ok()).toBe(true)
    const rolesBody = await rolesResponse.json()
    const existingRole = (rolesBody.data.roles || rolesBody.data).find((r: any) => r.name === 'Dynamic Regression Role')

    if (existingRole) {
      roleId = existingRole.id
    } else {
      const createRoleResponse = await requestContext.post('http://localhost:3001/api/v1/roles', {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          name: 'Dynamic Regression Role',
          description: 'Testing role with shifting permissions',
          accessPolicy: 'RESTRICTED'
        }
      })
      expect(createRoleResponse.ok()).toBe(true)
      const createRoleBody = await createRoleResponse.json()
      roleId = createRoleBody.data.id
    }

    // 4. Find or Create dynamic.tester User
    const usersResponse = await requestContext.get('http://localhost:3001/api/v1/users?q=dynamic.tester', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect(usersResponse.ok()).toBe(true)
    const usersBody = await usersResponse.json()
    const testerUser = usersBody.data.users.find((u: any) => u.loginName === 'dynamic.tester')

    if (testerUser) {
      userId = testerUser.id
    } else {
      const createUserResponse = await requestContext.post('http://localhost:3001/api/v1/users', {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          loginName: 'dynamic.tester',
          firstName: 'Dynamic',
          lastName: 'Tester',
          email: 'dynamic.tester@hedgehog.com',
          password: 'Password123!',
          isAdministrator: false
        }
      })
      expect(createUserResponse.ok()).toBe(true)
      const createUserBody = await createUserResponse.json()
      userId = createUserBody.data.id
    }

    // 5. Clean up any default/lingering role assignments (like default Viewer) assigned on creation
    const lingerAssignmentsResponse = await requestContext.get(`http://localhost:3001/api/v1/role-assignments?userId=${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect(lingerAssignmentsResponse.ok()).toBe(true)
    const lingerAssignmentsBody = await lingerAssignmentsResponse.json()
    for (const assignment of lingerAssignmentsBody.data.assignments) {
      if (assignment.role.id !== roleId) {
        await requestContext.delete(`http://localhost:3001/api/v1/role-assignments/${assignment.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
      }
    }

    // 6. Ensure the user is assigned our Dynamic Regression Role for the TMTT project context
    const assignmentsResponse = await requestContext.get(`http://localhost:3001/api/v1/role-assignments?userId=${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect(assignmentsResponse.ok()).toBe(true)
    const assignmentsBody = await assignmentsResponse.json()
    const existingAssignment = assignmentsBody.data.assignments.find(
      (a: any) => a.user.id === userId && a.role.id === roleId && a.project?.id === projectId
    )

    if (!existingAssignment) {
      const createAssignmentResponse = await requestContext.post('http://localhost:3001/api/v1/role-assignments', {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          userId,
          roleId,
          projectId
        }
      })
      expect(createAssignmentResponse.ok()).toBe(true)
    }

    // 7. Obtain access token for the dynamic.tester user session
    const testerLoginResponse = await requestContext.post('http://localhost:3001/api/v1/auth/login', {
      data: {
        loginName: 'dynamic.tester',
        password: 'Password123!'
      }
    })
    expect(testerLoginResponse.ok()).toBe(true)
    const testerLoginData = await testerLoginResponse.json()
    testerToken = testerLoginData.data.tokens.accessToken
  })

  test.afterAll(async () => {
    if (adminToken && requestContext) {
      // Remove assignments
      if (userId && roleId) {
        const assignmentsResponse = await requestContext.get(`http://localhost:3001/api/v1/role-assignments?userId=${userId}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
        if (assignmentsResponse.ok()) {
          const body = await assignmentsResponse.json()
          for (const assignment of body.data.assignments) {
            await requestContext.delete(`http://localhost:3001/api/v1/role-assignments/${assignment.id}`, {
              headers: { Authorization: `Bearer ${adminToken}` }
            })
          }
        }
      }
      // Delete user
      if (userId) {
        await requestContext.delete(`http://localhost:3001/api/v1/users/${userId}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
      }
      // Delete role
      if (roleId) {
        await requestContext.delete(`http://localhost:3001/api/v1/roles/${roleId}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
      }
    }
    await requestContext.dispose()
  })

  test('Iterate through permissions matrix to verify GRANT and DENY states', async () => {
    // Fetch all permission mappings from catalog
    const permissionsResponse = await requestContext.get('http://localhost:3001/api/v1/permissions', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect(permissionsResponse.ok()).toBe(true)
    const permissionsBody = await permissionsResponse.json()
    const permissionsList = permissionsBody.data.permissions.flattened

    const permMap = new Map<string, string>()
    for (const p of permissionsList) {
      permMap.set(p.name, p.id)
    }

    interface PermissionTestCase {
      permission: string
      endpoint: (pid: string) => string
    }

    const testCases: PermissionTestCase[] = [
      { permission: 'defects.read', endpoint: (pid) => `http://localhost:3001/api/v1/defects?projectId=${pid}` },
      { permission: 'requirements.read', endpoint: (pid) => `http://localhost:3001/api/v1/requirements?projectId=${pid}` },
      { permission: 'components.read', endpoint: (pid) => `http://localhost:3001/api/v1/projects/${pid}/components` },
      { permission: 'test-cases.read', endpoint: (pid) => `http://localhost:3001/api/v1/test-cases?projectId=${pid}` },
      { permission: 'cycles.read', endpoint: (pid) => `http://localhost:3001/api/v1/projects/${pid}/cycles` },
      { permission: 'environments.read', endpoint: (pid) => `http://localhost:3001/api/v1/test-environments?projectId=${pid}` },
      { permission: 'users.read', endpoint: () => 'http://localhost:3001/api/v1/users' },
      { permission: 'roles.read', endpoint: () => 'http://localhost:3001/api/v1/roles' },
      { permission: 'role-assignments.read', endpoint: () => 'http://localhost:3001/api/v1/role-assignments' }
    ]

    for (const testCase of testCases) {
      const permId = permMap.get(testCase.permission)
      if (!permId) {
        console.log(`⚠️ Permission not found in DB catalog: ${testCase.permission}`)
        continue
      }

      console.log(`🔍 Verifying permission: ${testCase.permission}`)

      // A. Grant permission
      const grantResponse = await requestContext.put('http://localhost:3001/api/v1/role-permissions', {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          roleId,
          permissionIds: [permId]
        }
      })
      expect(grantResponse.ok()).toBe(true)

      // Assert Grant state: dynamic.tester request succeeds
      const testerSuccessResponse = await requestContext.get(testCase.endpoint(projectId), {
        headers: { Authorization: `Bearer ${testerToken}` }
      })
      expect(testerSuccessResponse.status()).toBe(200)

      // B. Revoke permission
      const revokeResponse = await requestContext.put('http://localhost:3001/api/v1/role-permissions', {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          roleId,
          permissionIds: []
        }
      })
      expect(revokeResponse.ok()).toBe(true)

      // Assert Revoke state: dynamic.tester request is rejected with 403 Forbidden
      const testerFailResponse = await requestContext.get(testCase.endpoint(projectId), {
        headers: { Authorization: `Bearer ${testerToken}` }
      })
      expect(testerFailResponse.status()).toBe(403)
    }
  })
})
