import React, { ComponentProps } from 'react'

import Button from '@/shared/components/Button'

type T_Props = Omit<ComponentProps<typeof Button>, 'type'>

const Submit: React.FC<T_Props> = ({ children, ...props }) => (
  <Button type="submit" {...props}>
    {children}
  </Button>
)

export default Submit
