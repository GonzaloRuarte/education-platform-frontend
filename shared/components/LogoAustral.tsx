import Image, { ImageProps } from 'next/image'

interface I_Props {
  width: ImageProps['width']
  height: ImageProps['height']
}

const LogoAustral = ({ width, height }: I_Props) => {
  return <Image src={'/logo_austral_@2x.png'} {...{ width, height }} alt="Universidad Austral" priority />
}

export default LogoAustral
