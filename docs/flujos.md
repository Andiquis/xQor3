si usuario se registra por primera vez con los datos básicos como:
  - Nombre completo
  - Correo electrónico
  - Contraseña
  - Confirmación de contraseña

entonces se crea el usuario con rol `usuario` por defecto sin verificación de email y se envía un correo de verificación.

si el caso fue registro por OAuth, el
usuario se crea automáticamente con rol `usuario` y email verificado, ademas se inicia sesión automáticamente.

caso 2:
si el usuario se registro y valido su email, pero su rol es superadmin, entonces el sistema debe enviarle un correo indicando que su cuenta esta en revisión y que un superadmin debe aprobar su cuenta para que pueda iniciar sesión.
ademas despues de un login exitoso el superadmin debe recibir una alerta de establecer la segunda capa de seguridad (2FA).

caso 3:
si el usuario se registro y valido su email, pero su rol es admin, entonces el sistema debe enviarle un correo indicando que su cuenta esta en revisión y que un superadmin debe aprobar su cuenta para que pueda iniciar sesión.

caso 4: