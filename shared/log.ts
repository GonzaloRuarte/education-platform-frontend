const logInfo = (...data: any) => {
  console.log('INFO:', ...data)
}

const logWarning = (...data: any) => {
  console.log('WARNING:', ...data)
}

const logError = (...data: any) => {
  console.log('ERROR:', ...data)
}

const logDebug = (...data: any) => {
  console.log('DEBUG:', ...data)
}

const log = {
  info: logInfo,
  warning: logWarning,
  error: logError,
  debug: logDebug,
}

type T_LogTypes = 'info' | 'warning' | 'error' | 'debug'
type T_LogService = (...data: any) => void
type T_Loggger = Record<T_LogTypes, T_LogService>

export default log

export { logInfo, logWarning, logError, logDebug }
export type { T_Loggger, T_LogService }
