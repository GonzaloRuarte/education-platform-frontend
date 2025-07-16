import { IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputControlled, { InputControlledProps } from '@/shared/forms/InputControlled';
import { FieldValues } from 'react-hook-form';
import { useState } from 'react';

/* Wrapper version */
function PasswordInputControlled<T extends FieldValues>(
  props: Omit<InputControlledProps<T>, 'type'>,
) {
  const [show, setShow] = useState(false);

  return (
    <InputControlled
      {...props}
      type={show ? 'text' : 'password'}
      InputProps={{                       
        endAdornment: (
          <IconButton
            edge="end"
            onClick={() => setShow(!show)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        ),
      }}
    />
  );
}

export default PasswordInputControlled;