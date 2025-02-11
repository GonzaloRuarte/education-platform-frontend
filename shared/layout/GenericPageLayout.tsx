import { T_FCwChildren } from '@/shared/types'
import Container from '@mui/material/Container'

const GenericPageLayout: T_FCwChildren = ({ children }) => {
  return <Container>{children}</Container>
}



export default GenericPageLayout