# Final2

**Materia:** Laboratorio de Computación IV  
**Nivel:** 4º Cuatrimestre  
**Tipo de Examen:** Trabajo práctico - Clínica Online  
**Alumno:** Martin Raul Arrua  
**Legajo:** 66806

---

Firebase Dominios


1-lab4-f8768.web.app
2-https://lab4-f8768.firebaseapp.com/




Sprint 6
● Idiomas

Sprint 6
● Idiomas
○ Para esta entrega necesitamos que nuestro sistema tenga la posibilidad de estar en distintos
idiomas.
○ Estos idiomas son:
■ Inglés
■ Español
■ Portugues

Se eligio las pantallas 

Para el cambio de idioma en el Home usé la librería @ngx-translate/core. Puse un selector de idioma arriba a la derecha; cuando el usuario elige uno, la app carga los textos de ese idioma automáticamente usando archivos .json (español, inglés y portugués) que están en la carpeta i18n. Así, la interfaz se traduce al instante y no hace falta recargar la página ni cambiar el código, solo editar los textos en esos archivos.

Sobre Home Component

<img width="1257" height="797" alt="001_Diccionario de datos Ejemplo" src="https://github.com/user-attachments/assets/fb8cb07d-d301-49b0-98c6-02863f245bba" />
<img width="1241" height="733" alt="002_Diccionario de datos Ejemplo" src="https://github.com/user-attachments/assets/ca4d5320-2662-4cb6-8a01-34bda2018553" />
<img width="1239" height="763" alt="003_Diccionario de datos Ejemplo" src="https://github.com/user-attachments/assets/e680ab7a-2128-4ce2-bdc5-d063375cf2ff" />


Sobre el component Login

<img width="1147" height="827" alt="006_Diccionario de datos Ejemplo" src="https://github.com/user-attachments/assets/fa545590-6768-4b88-82fb-6d73082f6d34" />
<img width="1069" height="801" alt="005_Diccionario de datos Ejemplo" src="https://github.com/user-attachments/assets/cc6e9ce6-327f-4661-91a5-52c404c7e48c" />
<img width="1113" height="773" alt="004_Diccionario de datos Ejemplo" src="https://github.com/user-attachments/assets/229c5606-9614-4773-880e-c0abf9ca3e46" />

Sobre el component Registro

<img width="1123" height="919" alt="009_Diccionario de datos Ejemplo" src="https://github.com/user-attachments/assets/0fae0fb6-3a5e-4aa8-b690-29979bf1f258" />
<img width="1125" height="915" alt="008_Diccionario de datos Ejemplo" src="https://github.com/user-attachments/assets/dc7d54ce-6ae2-4032-8b88-6bd6772df3b2" />
<img width="1101" height="917" alt="007_Diccionario de datos Ejemplo" src="https://github.com/user-attachments/assets/f6de1a65-1293-4079-84ba-4dd3d7297af6" />


Encuesta de Atención
○ Debemos contar con datos de un mínimo de 30 días, con acciones hechas por médicos y
pacientes para poder ver resultados en las estadísticas.
○ Debemos darle al paciente la posibilidad de completar una encuesta de satisfacción con al menos
5 controles. Esta encuesta nos servirá para evaluar la atención de nuestros profesionales y debe
tener:
■ SOLO UN cuadro de texto
■ Estrellas para calificar
■ Radio button
■ Check box
■ Control de rango, etc


Seleccion  de encuestas:

<img width="967" height="897" alt="001" src="https://github.com/user-attachments/assets/d74ff929-4d2d-4bee-a1f3-50d2c611b2b0" />

La encuesta se habilita solo si el paciente no cargo anteriormente una consulta sobre el turno realizado.

<img width="1303" height="959" alt="002" src="https://github.com/user-attachments/assets/bd23bd10-cb9c-48df-8813-5b89ad923a5d" />
Solo se habilita el botón enviar, cuando todos los campos estén llenos.


Agregue controles en la encuesta de turno paciente para que el usuario pueda responder preguntas sobre la atención recibida. Estos controles incluyen campos como selección de opciones, casillas y comentarios, permitiendo que el paciente evalúe el servicio de forma sencilla y rápida. Todo se guarda en base de datos supasebase para su posterior consulta para los informes con graficos


Generar informes en gráficos estadísticos
○ Debemos sumar los siguientes informes:
■ Cantidad de visitas que tuvo la clínica.
■ Cantidad de pacientes por especialidad.
■ Cantidad de médicos por especialidad.
■ Informe basado en la encuesta al cliente mostrando cuáles fueron las respuestas.
● Informe por cantidad de visitas.
● Se ingresa selecciona un paciente y se muestran todos los turnos.(los tomados ,
los suspendidos , los pendientes , etc.)
● Cantidad de pacientes por especialidad ( con posibilidad de descargar la imagen
del gráfico)
● Cantidad de médicos por especialidad ( con posibilidad de descargar la imagen del
gráfico

Solo el administrador puede entrear a esta informacion, en el boton Estadistica 2
Aqui se agrego informacion basicamente sobre los movimientos de la clinicas, cada grafico tiene una breve lista de informacion que acompania al grafico, se coloco el boton de descarga para descargar por pdf.


Se inicia sesión con el administrador 

<img width="1169" height="877" alt="001" src="https://github.com/user-attachments/assets/1e61dd36-5883-4e44-9df2-73cc863bdcd3" />


Al iniciar sesión con el admin, se habilita el botón estadística 2

<img width="807" height="781" alt="002" src="https://github.com/user-attachments/assets/d39ba98e-0c6d-4fd3-a7f2-4d90fee1b491" />


Informe por Cantidad de Visitas a la Clinica

<img width="910" height="562" alt="003" src="https://github.com/user-attachments/assets/0a3c9191-8b84-406f-9b6c-b56ccbef7185" />

Informe Pacientes por especialidad

<img width="810" height="442" alt="004" src="https://github.com/user-attachments/assets/e2ebdd46-c9c5-4622-889a-670acd48864c" />

Informe Médicos por especialidad

<img width="810" height="422" alt="005" src="https://github.com/user-attachments/assets/44a62c45-d4ab-45d9-a603-a430bfd20370" />

Informe Resultado encuestas a clientes

<img width="855" height="358" alt="006" src="https://github.com/user-attachments/assets/a06229ce-983b-4a39-b495-5b2d166b1f3e" />

Informe turnos por paciente seleccionado

<img width="814" height="397" alt="007" src="https://github.com/user-attachments/assets/430e4213-9d0d-48dd-8dee-2cd73cc3b634" />



[reporte-visitas.pdf](https://github.com/user-attachments/files/22520129/reporte-visitas.pdf)
[reporte-pacientes-especialidad.pdf](https://github.com/user-attachments/files/22520128/reporte-pacientes-especialidad.pdf)
[reporte-medicos-especialidad.pdf](https://github.com/user-attachments/files/22520127/reporte-medicos-especialidad.pdf)
[reporte-encuestas-clientes.pdf](https://github.com/user-attachments/files/22520126/reporte-encuestas-clientes.pdf)


En el componente estadistica2 se implementaron gráficos usando una librería como Chart.js (o similar) para visualizar datos de turnos y usuarios. Los datos se obtienen desde el backend y se procesan en el componente para mostrar cantidades, porcentajes y tendencias. Los gráficos son de barras y se actualizan automáticamente según la información disponible en la base de datos. Esto permite analizar el uso de la clínica de manera clara y dinámica.




