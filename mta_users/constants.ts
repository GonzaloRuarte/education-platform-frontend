import { EntityName } from '@/shared/utils'

const USER_NAME = new EntityName({ gender: 'M', plural: 'usuarios', singular: 'usuario' })
const ADMIN_PROFILE_NAME = new EntityName({ gender: 'M', plural: 'administradores', singular: 'administrador' })

export { USER_NAME, ADMIN_PROFILE_NAME }
