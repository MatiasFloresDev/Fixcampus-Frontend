
const $=s=>document.querySelector(s);
const form=$('#login-form'),email=$('#correo'),password=$('#contrasena'),submit=$('#login-submit');
const error=$('#login-error'),success=$('#login-success'),session=$('#session-message');
const params=new URLSearchParams(location.search);
if(params.get('estado')==='sesion')session.hidden=false;
if(params.get('estado')==='error')error.hidden=false;
if(params.get('estado')==='servidor'){error.hidden=false;$('#login-error-text').textContent='No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.';}
function validate(input,span,valid){input.setAttribute('aria-invalid',String(!valid));$(span).hidden=valid;return valid;}
form.addEventListener('submit',e=>{e.preventDefault();error.hidden=true;success.hidden=true;
 const validEmail=validate(email,'#correo-error',email.validity.valid),validPass=validate(password,'#contrasena-error',password.value.trim().length>0);
 if(!validEmail||!validPass){(validEmail?password:email).focus();return;}
 submit.disabled=true;submit.setAttribute('aria-busy','true');submit.innerHTML='<span class="spinner" aria-hidden="true"></span><span>Ingresando...</span>';
 setTimeout(()=>{submit.disabled=false;submit.removeAttribute('aria-busy');submit.innerHTML='<span>Iniciar sesión</span><svg class="icon" aria-hidden="true"><use href="#i-arrow"></use></svg>';
 session.hidden=true;if(params.get('estado')==='error'||params.get('estado')==='servidor'){error.hidden=false;}else{success.hidden=false;}},650);
});
email.addEventListener('input',()=>{if(email.getAttribute('aria-invalid')==='true')validate(email,'#correo-error',email.validity.valid);});
password.addEventListener('input',()=>{if(password.getAttribute('aria-invalid')==='true')validate(password,'#contrasena-error',password.value.trim().length>0);});
$('#password-toggle').addEventListener('click',()=>{const show=password.type==='password';password.type=show?'text':'password';$('#password-toggle').setAttribute('aria-pressed',String(show));$('#password-toggle').setAttribute('aria-label',show?'Ocultar contraseña':'Mostrar contraseña');});
const menu=$('#menu-toggle'),mobile=$('#menu-movil');
menu.addEventListener('click',()=>{const open=!mobile.classList.contains('open');mobile.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobile.classList.contains('open')){mobile.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');menu.focus();}});
const dialog=$('#register-dialog');
document.querySelectorAll('[data-register]').forEach(button=>button.addEventListener('click',()=>dialog.showModal()));
$('#close-register').addEventListener('click',()=>dialog.close());
$('#register-form').addEventListener('submit',e=>{e.preventDefault();email.value=$('#registro-correo').value;dialog.close();success.hidden=false;success.querySelector('strong').textContent='Registro de ejemplo completado';success.querySelector('div').lastChild.textContent=' Puedes volver al formulario de acceso. No se creó una cuenta real.';email.focus();});
