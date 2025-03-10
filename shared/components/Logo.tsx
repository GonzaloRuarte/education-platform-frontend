import Image from 'next/image'

const Logo = ({ width, height }) => {
  return <Image src="/logo_color.png" {...{ width, height }} alt="Picture of the author" />
}

export default Logo
