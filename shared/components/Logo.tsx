import Image, { ImageProps } from 'next/image'

type T_LogoVariant = 'color' | 'white'
interface I_Props {
  width: ImageProps['width']
  height: ImageProps['height']
  variant?: T_LogoVariant
}

const Logo = ({ width, height, variant = 'color' }: I_Props) => {
  const sources: Record<T_LogoVariant, string> = {
    color: '/logo_color.png',
    white: '/logo_white.png',
  }
  return <Image src={sources[variant]} {...{ width, height }} alt="Picture of the author" priority />
}

export default Logo
