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
[Imagenes sobre 3 idiomas.docx](https://github.com/user-attachments/files/22519749/Imagenes.sobre.3.idiomas.docx)
Para el cambio de idioma en el Home usé la librería @ngx-translate/core. Puse un selector de idioma arriba a la derecha; cuando el usuario elige uno, la app carga los textos de ese idioma automáticamente usando archivos .json (español, inglés y portugués) que están en la carpeta i18n. Así, la interfaz se traduce al instante y no hace falta recargar la página ni cambiar el código, solo editar los textos en esos archivos.


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

[Encuestas Documentacion.docx](https://github.com/user-attachments/files/22519844/Encuestas.Documentacion.docx)

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

[Informes con Graficos.docx](https://github.com/user-attachments/files/22520089/Informes.con.Graficos.docx)



[reporte-visitas.pdf](https://github.com/user-attachments/files/22520129/reporte-visitas.pdf)
[reporte-pacientes-especialidad.pdf](https://github.com/user-attachments/files/22520128/reporte-pacientes-especialidad.pdf)
[reporte-medicos-especialidad.pdf](https://github.com/user-attachments/files/22520127/reporte-medicos-especialidad.pdf)
[reporte-encuestas-clientes.pdf](https://github.com/user-attachments/files/22520126/reporte-encuestas-clientes.pdf)


En el componente estadistica2 se implementaron gráficos usando una librería como Chart.js (o similar) para visualizar datos de turnos y usuarios. Los datos se obtienen desde el backend y se procesan en el componente para mostrar cantidades, porcentajes y tendencias. Los gráficos son de barras y se actualizan automáticamente según la información disponible en la base de datos. Esto permite analizar el uso de la clínica de manera clara y dinámica.




