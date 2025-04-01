import { toast, ToastOptions } from 'react-toastify'

const options: ToastOptions = { position: 'bottom-right', style: { zIndex: 10000000 } }

const errorToast = (msg: string) => toast.error(msg, options)
const successToast = (msg: string) => toast.success(msg, options)
const warningToast = (msg: string) => toast.warning(msg, options)

const useToasts = () => {
  return {
    errorToast,
    successToast,
    warningToast,
    dismissAll: () => toast.dismiss(),
  }
}

export { errorToast, successToast, warningToast }

export default useToasts
