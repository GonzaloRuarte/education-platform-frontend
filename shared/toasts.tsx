import { toast, ToastOptions } from 'react-toastify'

const options: ToastOptions = { position: "bottom-right" }

const errorToast = (msg: string) => toast.error(msg, options)
const successToast = (msg: string) => toast.success(msg, options)
const warningToast = (msg: string) => toast.warning(msg, options)

const useToasts = () => {
  return {
    errorToast, successToast, warningToast
  }
}

export {
  errorToast, successToast, warningToast
}

export default useToasts