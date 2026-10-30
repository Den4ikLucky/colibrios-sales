'use strict';
/* Public editorial data, not a record of customer testimonials.
 * Persona names identify educational scenarios. Only the first five persona
 * ages have a production-source reference; all unknown ages/cities stay null.
 * Text summaries are not transcripts of the associated role-avatar videos.
 * Relative media URLs are project-root-relative, not script-relative.
 */
(() => {
  const roleLabels = Object.freeze({
    'a-prepod': "Tutores y profesores",
    'a-psiholog': "Psicólogos y entrenadores.",
    'a-novichok': "Expertos y novatos",
    'a-marketolog': "Comercializadores y productores",
    'a-magazin': "Comercios y servicios"
  });

  const cases = [
    {
      id: 'student_01', roleId: 'a-prepod', name: "elena", age: 34, city: null,
      specialty: "tutor de ingles",
      headline: "Revisión educativa · recordatorio en lugar de explicación repetida",
      quote: "El ejemplo educativo muestra un recordatorio para una breve introducción en inglés. En lugar de una historia de éxito, aquí se analizan un ejemplo de respuesta, una tarea para el estudiante y una prueba realizada por el maestro.",
      taskBuiltIn3Evenings: "Tarea de estudio durante tres tardes por $19: preparar una nota con una muestra, ejercicio y autoevaluación. En el último paso, el profesor revisa el vocabulario y guarda la versión aprobada.",
      routineBefore: "En el escenario original, el profesor explica de nuevo cada vez la estructura de la breve introducción. Las respuestas de muestra permanecen en notas diferentes, por lo que deberá buscar un ejemplo adecuado manualmente.",
      resultAfter: "Artefacto de construcción objetivo: una hoja de trucos probada con ejercicio y muestra. En una solicitud de prueba, debe verificar el resultado de la versión deseada y no prometer un aumento en las calificaciones.",
      videoSrc: 'assets/videos/student_01_a-prepod.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "LECCIÓN",
      nextStep: "En la ruta de formación, envíe la palabra LECCIÓN y verifique la emisión del recordatorio en una solicitud de prueba."
    },
    {
      id: 'student_02', roleId: 'a-psiholog', name: "puerto deportivo", age: 41, city: null,
      specialty: "psicólogo",
      headline: "Sesión de entrenamiento · reglas para la primera reunión",
      quote: "El estudio de caso se refiere a un memorando organizativo antes de la primera reunión. Comprueba el formato, la zona horaria y la orden de transferencia, y no utiliza historias personales de clientes.",
      taskBuiltIn3Evenings: "Tarea de estudio durante tres noches por $19: recopile una nota de las reglas de grabación aprobadas. El especialista aclara de forma independiente las condiciones desconocidas antes de permitir la publicación del texto.",
      routineBefore: "En el escenario original, las mismas cuestiones organizativas aparecen en correspondencia diferente. El especialista verifica manualmente la hora de la cita y repite las reglas acordadas para programar y reprogramar.",
      resultAfter: "Artefacto de construcción objetivo: texto acordado con respuestas a preguntas organizativas. La revisión se refiere a la exactitud de las reglas y la privacidad, no al diagnóstico o al resultado terapéutico.",
      videoSrc: 'assets/videos/student_02_a-psiholog.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "REUNIÓN",
      nextStep: "En la ruta de formación solicitar la palabra REUNIÓN y consultar la nota con las normas aprobadas por el especialista."
    },
    {
      id: 'student_03', roleId: 'a-novichok', name: "Ígor", age: 44, city: null,
      specialty: "Experto, primer proyecto de contenidos.",
      headline: "Análisis educativo · publicación a partir de una nota de voz",
      quote: "El estudio de caso comienza con una explicación escrita por el experto en sus propias palabras. Se prepara un borrador de una publicación a partir de la nota, y el autor aún debe verificar los hechos y la redacción.",
      taskBuiltIn3Evenings: "Tarea de estudio durante tres tardes por $19: transcribe tu propia nota y prepara una publicación. Luego, el autor compara las declaraciones con la fuente y guarda solo el texto aprobado.",
      routineBefore: "En el escenario original, las explicaciones útiles permanecen en las notas de voz del teléfono. Antes de la publicación, el experto vuelve a escribir el texto y elimina manualmente los pensamientos repetitivos del borrador.",
      resultAfter: "Artefacto de compilación de destino: nota original y publicación revisada con el mismo tema. La publicación sigue siendo una decisión individual del autor y aquí no se midieron los ingresos ni el alcance.",
      videoSrc: 'assets/videos/student_03_a-novichok.mp4', duration: '0:10', durationSeconds: 10,
      codeword: "NOTA",
      nextStep: "En la ruta de estudio, solicite la palabra NOTA y compare cada declaración de publicación con la publicación original."
    },
    {
      id: 'student_04', roleId: 'a-marketolog', name: "alina", age: 25, city: null,
      specialty: "Comercializador",
      headline: "Análisis de la formación · contenido del brief acordado",
      quote: "Un estudio de caso vincula un informe acordado con borradores de publicaciones. El editor comprueba el significado y las limitaciones, por lo que la generación del texto no sustituye al acuerdo con el cliente.",
      taskBuiltIn3Evenings: "Tarea de formación durante tres tardes por $19: recoger una ficha de proyecto y borradores según el resumen. Cada publicación debe sopesarse con los hechos subyacentes y las limitaciones de la marca.",
      routineBefore: "En el escenario original, los requisitos del cliente están dispersos en mensajes y documentos. Antes de cada texto, el especialista en marketing recopila manualmente los datos del producto, el tono de comunicación y una lista de prohibiciones.",
      resultAfter: "Artefacto objetivo de la asamblea: un resumen único y borradores de publicaciones asociados. La aceptación verifica el cumplimiento del código fuente y no una reducción de costos o un aumento de ventas ficticios.",
      videoSrc: 'assets/videos/student_04_a-marketolog.mp4', duration: '0:10', durationSeconds: 9.990083,
      codeword: "BRIF",
      nextStep: "En la ruta de formación, pide la palabra BRIF y comprueba que el borrador no haya añadido propiedades del producto no confirmadas."
    },
    {
      id: 'student_05', roleId: 'a-magazin', name: "svetlana", age: 29, city: null,
      specialty: "Taller de flores",
      headline: "Análisis educativo · respuestas sobre cómo pedir un ramo",
      quote: "Este tutorial se centra en responder preguntas recurrentes en un taller de flores. Un empleado confirma la composición del ramo, la disponibilidad de flores y la posibilidad de entrega, y la plantilla ayuda a formatear la respuesta.",
      taskBuiltIn3Evenings: "Tarea de estudio durante tres tardes por $19: recopile un recordatorio de pedido y plantillas de respuestas. El cheque anota por separado información que depende de la disponibilidad de flores y del calendario de entrega.",
      routineBefore: "En el escenario original, el empleado repite los términos del pedido en cada nueva correspondencia. La disponibilidad real de flores debe aclararse por separado para que la respuesta inmediata no prometa demasiado.",
      resultAfter: "Artefacto de ensamblaje de destino: nota de pedido con confirmación obligatoria de disponibilidad y entrega. Esta es una estructura de respuesta verificable, no una prueba de ventas ni de una operación de pago en vivo.",
      videoSrc: 'assets/videos/student_05_a-magazin.mp4', duration: '0:10', durationSeconds: 9.999083,
      codeword: "RAMO",
      nextStep: "En la ruta de capacitación pregunta por la palabra RAMO y consulta la respuesta para algún producto que se encuentre agotado."
    },
    {
      id: 'student_06', roleId: 'a-prepod', name: "Olga", age: null, city: null,
      specialty: "tutor de matemáticas",
      headline: "Análisis educativo · tareas con soluciones comprobadas",
      quote: "Un ejemplo de tutorial examina la preparación de una tarjeta didáctica sobre un tema matemático. El profesor resuelve las tareas de forma independiente y comprueba las respuestas antes de entregar la tarjeta al alumno.",
      taskBuiltIn3Evenings: "Tarea de estudio durante tres tardes por $19: prepare tareas de diferente dificultad y claves. El profesor comprueba cada solución y guarda una tarjeta con criterios claros de autoevaluación.",
      routineBefore: "En el guión original, las tareas y respuestas se almacenan en archivos separados. Al preparar una lección, el profesor recopila manualmente la selección requerida y vuelve a verificar las claves de respuestas.",
      resultAfter: "Artefacto de construcción objetivo: tarjeta de tareas con soluciones y explicaciones comprobadas. La aceptación implica una decisión independiente del maestro y los cambios en el rendimiento académico requieren una observación por separado.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "TAREA",
      nextStep: "En la ruta de entrenamiento pregunta por la palabra TAREA y consulta la solución a cada tarea, independientemente del generador."
    },
    {
      id: 'student_07', roleId: 'a-psiholog', name: "pablo", age: null, city: null,
      specialty: "Entrenador",
      headline: "Revisión de formación · confirmación de entrada sin historias personales",
      quote: "El tutorial muestra una plantilla para confirmar una cita para una reunión de trabajo. Para prepararlo son suficientes las condiciones de servicio aprobadas y no se necesita información sensible sobre la persona.",
      taskBuiltIn3Evenings: "Tarea de formación durante tres tardes por $19: recoger la confirmación del registro y el procedimiento de transferencia. El formato de la reunión, costo y fechas disponibles se toman únicamente de las condiciones confirmadas por el especialista.",
      routineBefore: "En el escenario original, los registros de acuse de recibo se compilan manualmente a partir de varios mensajes. Al reprogramar una reunión, es fácil olvidarse de comprobar la zona horaria o actualizar los términos obsoletos.",
      resultAfter: "Construya el artefacto de destino: plantilla de confirmación verificable y script de migración de registros independiente. La prueba utiliza datos ficticios y no hace recomendaciones clínicas ni promete resultados.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "REGISTRO",
      nextStep: "En la ruta de capacitación, solicite la palabra CITA y marque para reprogramar la cita sin compartir el historial personal del cliente."
    },
    {
      id: 'student_08', roleId: 'a-novichok', name: "Nadezhda", age: null, city: null,
      specialty: "consultor novato",
      headline: "Análisis educativo · descripción de un servicio claro",
      quote: "Un estudio de caso ayuda a describir un servicio sin enumerar todas las competencias. El texto describe la tarea del cliente, el alcance del trabajo y los límites de responsabilidad, pero no promete ingresos garantizados.",
      taskBuiltIn3Evenings: "Tarea de formación durante tres tardes por $19: emitir una tarjeta para un servicio. Debe indicar los datos de entrada, el resultado específico del trabajo y las condiciones que requieren aclaración.",
      routineBefore: "En el escenario original, la descripción del servicio cambia de una conversación a otra. Cada vez, un experto novato explica de nuevo la composición del trabajo y responde las mismas preguntas aclaratorias.",
      resultAfter: "Artefacto objetivo de la asamblea: una tarjeta de servicio con composición y límites claros. La prueba determina si el lector puede explicar el siguiente paso, pero no prueba la demanda.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "SERVICIO",
      nextStep: "En la ruta de estudio, solicite la palabra SERVICIO y solicite al lector de la prueba que nombre la composición y limitaciones del trabajo."
    },
    {
      id: 'student_09', roleId: 'a-marketolog', name: "Kirill", age: null, city: null,
      specialty: "productor de videos cortos",
      headline: "Análisis de formación · escenarios de una sola fuente",
      quote: "El tutorial convierte un material aprobado en varios rincones escritos. Cada vídeo tiene su propia tesis marcada, por lo que un conjunto de tomas parafraseadas no se considera un episodio terminado.",
      taskBuiltIn3Evenings: "Tarea de formación durante tres tardes por $19: crear guiones para vídeos cortos basados en el código fuente. Cada escenario va acompañado de un vínculo a un hecho comprobado y un siguiente paso claro.",
      routineBefore: "En el guión inicial, los temas de los vídeos se inventan por separado de los materiales del proyecto terminado. El productor busca manualmente los hechos originales y sólo se da cuenta de las repeticiones después de escribir los guiones.",
      resultAfter: "Artefacto objetivo de la asamblea: un cuadro de escenarios con diferentes tesis y fuentes de enunciados. La validación tiene que ver con el significado y la repetición, y la retención de la audiencia sólo puede evaluarse después de la publicación.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "ESCENARIO",
      nextStep: "En la ruta de aprendizaje pregunta por la palabra ESCENARIO y comprueba que diferentes vídeos cubren diferentes preguntas."
    },
    {
      id: 'student_10', roleId: 'a-magazin', name: "vera", age: null, city: null,
      specialty: "Taller de reparación",
      headline: "Revisión de formación · tarjeta de solicitud de reparación",
      quote: "El ejemplo del tutorial reúne una tarjeta de solicitud previa a la reparación clara. El costo y el plazo se confirman después de la estimación por parte del maestro, y el formulario no revela una conjetura como una estimación ya hecha.",
      taskBuiltIn3Evenings: "Tarea de formación durante tres tardes por $19: preparar una tarjeta de solicitud y un acuse de recibo. La verificación separa la descripción del mal funcionamiento del precio y el plazo, lo que requiere la evaluación de un especialista.",
      routineBefore: "En el escenario original, la descripción del fallo se pierde entre mensajes cortos del cliente. El empleado especifica manualmente el modelo del producto, la naturaleza del problema y un método conveniente para una mayor comunicación.",
      resultAfter: "Artefacto de compilación de destino: solicitud y respuesta estructuradas con el siguiente paso correcto. La prueba comprueba la integridad de la descripción, pero no sustituye al diagnóstico técnico ni a la aprobación de presupuestos.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "REPARACIÓN",
      nextStep: "En la ruta de formación pregunta por la palabra REPARACIÓN y comprueba que la plantilla no asigna coste sin máster."
    },
    {
      id: 'student_11', roleId: 'a-prepod', name: "andrés", age: null, city: null,
      specialty: "Profesor de Curso Profesional",
      headline: "Lista de verificación de análisis educativo para una lección práctica",
      quote: "El estudio de caso vincula una tarea práctica con criterios claros de preparación. El profesor verifica el trabajo mediante una lista de verificación, por lo que un hermoso diseño no reemplaza el contenido de la lección.",
      taskBuiltIn3Evenings: "Tarea de formación durante tres tardes por $19: recopilar instrucciones y lista de verificación de aceptación. Para cada ítem se necesita un cartel observable mediante el cual el alumno comprobará su trabajo.",
      routineBefore: "En el escenario original, los criterios de la tarea se explican verbalmente al comienzo de la clase. Al revisar el trabajo, el docente nuevamente escribe los mismos comentarios y aclara los requisitos para cada alumno.",
      resultAfter: "Artefacto de construcción de destino: instrucciones con un ejemplo y criterios verificables para completar la tarea. La aceptación utiliza un trabajo de prueba y las promesas de aprendizaje acelerado no se incluyen en este análisis.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "PRÁCTICA",
      nextStep: "En la ruta de formación, solicite la palabra PRÁCTICA y consulte la lista de verificación del trabajo de prueba obviamente incompleto."
    },
    {
      id: 'student_12', roleId: 'a-psiholog', name: "irina", age: null, city: null,
      specialty: "entrenador de carrera",
      headline: "Sesión de formación · agenda de la reunión de trabajo",
      quote: "El estudio de caso elabora una agenda de reunión para una tarea de trabajo previamente acordada. Contiene una pregunta de discusión y un documento esperado, pero ningún diagnóstico de personalidad ni promesa de empleo.",
      taskBuiltIn3Evenings: "Tarea de estudio durante tres tardes por $19: preparar una plantilla para la agenda y una nota resumida. El especialista verifica los límites del servicio y no transfiere la información personal del cliente al generador.",
      routineBefore: "En el escenario original, las preguntas para la reunión se recogen en diferentes notas de trabajo. Después de la conversación, el especialista reconstruye manualmente las acciones acordadas y las separa de las suposiciones no confirmadas.",
      resultAfter: "Construir artefacto objetivo: una agenda y una plantilla para capturar las próximas acciones acordadas. La prueba se refiere a la estructura del documento y los resultados profesionales o psicológicos no se indican aquí.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "AGENDA",
      nextStep: "En la ruta formativa pide la palabra AGENDA y prueba la plantilla en una situación laboral completamente ficticia."
    },
    {
      id: 'student_13', roleId: 'a-novichok', name: "máxima", age: null, city: null,
      specialty: "Experto independiente",
      headline: "Análisis educativo · respuestas basadas en materiales propios",
      quote: "El ejemplo de formación recopila respuestas a preguntas de los propios materiales del experto. Cada afirmación está asociada a una fuente específica y los espacios siguen siendo preguntas para el autor en lugar de una respuesta ficticia.",
      taskBuiltIn3Evenings: "Tarea de estudio durante tres noches por $19: recopilar un pequeño libro de referencia basado en los materiales del autor. Para cada respuesta, debe guardar la fuente y verificar si hay adiciones no confirmadas.",
      routineBefore: "En el guión original, las explicaciones necesarias se encuentran dispersas entre documentos y notas. El experto busca manualmente la respuesta anterior y vuelve a comprobar la relevancia del texto antes de enviarlo.",
      resultAfter: "Target Build Artifact: una guía de respuestas con materiales originales y limitaciones. Una pregunta de prueba sin fuente debería revelar una brecha, no generar una ficción convincente.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "RESPUESTA",
      nextStep: "En la ruta de aprendizaje, solicite la palabra RESPUESTA y marque la pregunta que no esté en los materiales fuente."
    },
    {
      id: 'student_14', roleId: 'a-marketolog', name: "Olesya", age: null, city: null,
      specialty: "Productor de un proyecto educativo.",
      headline: "Análisis educativo · cola de publicaciones aprobadas",
      quote: "El estudio de caso separa la redacción, la aprobación y la preparación del material para su publicación. La persona responsable y la versión actual son visibles en la tarjeta, y la marca de preparación no se emite como un hecho de colocación.",
      taskBuiltIn3Evenings: "Tarea de formación durante tres noches por $19: recopile una cola de materiales con estados explícitos. Para cada texto, debe registrar la fuente, el editor responsable y un permiso de publicación por separado.",
      routineBefore: "En el guión original, las ediciones y los textos finales se mezclan en la correspondencia de trabajo. El productor determina manualmente qué versión se aprueba y quién debe revisar el siguiente material.",
      resultAfter: "Artefacto de compilación de destino: una cola con versiones, estados y conciliadores. La verificación detecta el estado no confirmado, pero no prueba que funcione la colocación automática en los canales.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "COLA",
      nextStep: "En la ruta de formación, solicite la palabra COLA y asegúrese de que el texto inconsistente no pueda llamarse publicado."
    },
    {
      id: 'student_15', roleId: 'a-magazin', name: "romano", age: null, city: null,
      specialty: "pequeña panadería",
      headline: "Tutorial · recordatorio de reserva",
      quote: "El estudio de caso crea un recordatorio de pedido anticipado para una pequeña panadería. Un empleado confirma la variedad, la composición y la información sobre los alérgenos, y el generador no inventa las propiedades de los productos horneados.",
      taskBuiltIn3Evenings: "Tarea de entrenamiento durante tres tardes por $19: recopilar una nota a partir de datos confirmados de la panadería. La composición de los productos, el procedimiento de confirmación del pedido y la relevancia de los plazos de recepción se comprueban por separado.",
      routineBefore: "En el escenario original, los clientes hacen las mismas preguntas sobre el surtido y la recepción del pedido. Un empleado cuenta manualmente las condiciones y comprueba la composición de cada producto mediante tarjetas de trabajo.",
      resultAfter: "Artefacto de compilación de destino: una nota con la fuente de información y la confirmación obligatoria del pedido. El control incluye preguntas sobre alérgenos, pero no reemplaza el control de la composición por parte de un empleado responsable.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "RESERVAR",
      nextStep: "En la ruta de capacitación, solicite la palabra PRE-ORDEN y verifique la pregunta sobre la composición con la ficha del producto aprobado."
    },
    {
      id: 'student_16', roleId: 'a-prepod', name: "ana", age: null, city: null,
      specialty: "Profesor de educación adicional",
      headline: "Análisis educativo · nota a los padres sobre los hechos de la lección",
      quote: "El ejemplo de enseñanza convierte las notas impersonales de la lección en un borrador de mensaje fácil de entender para los padres. El maestro verifica cada formulación con observación y no agrega evaluaciones de la personalidad del niño.",
      taskBuiltIn3Evenings: "Tarea de estudio durante tres tardes por $19: prepare una plantilla de mensaje basada en los resultados de la lección. Para las pruebas se utilizan registros ficticios sin nombres, fotografías ni datos personales de los niños.",
      routineBefore: "En el escenario original, el profesor redacta manualmente mensajes similares para los padres después de clase. Debe recordar por separado la tarea completada, la dificultad del estudiante y el paso acordado para practicar en casa.",
      resultAfter: "Artefacto objetivo de la construcción: un borrador de mensaje con el hecho de la lección y el siguiente ejercicio. El profesor comprueba los hechos antes de enviarlos, pero la plantilla no saca conclusiones sobre las capacidades del niño.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "ACTIVIDAD",
      nextStep: "En la ruta de estudio, solicite la palabra ACTIVIDAD y verifique que el borrador guardó solo las observaciones especificadas."
    },
    {
      id: 'student_17', roleId: 'a-psiholog', name: "serguéi", age: null, city: null,
      specialty: "Psicóloga en consultorio privado.",
      headline: "Revisión de la formación · respuestas públicas sobre el formato de trabajo",
      quote: "El estudio de caso recoge respuestas del público sobre el formato de trabajo del especialista. Las preguntas se refieren a la organización de reuniones y a los límites del servicio, por lo que la correspondencia personal y los casos clínicos no se incluyen en la colección.",
      taskBuiltIn3Evenings: "Tarea de formación durante tres tardes por $19: preparar una sección de cuestiones organizativas de acuerdo con las normas aprobadas. El especialista comprueba la redacción y separa la entrada habitual de las llamadas de ayuda de emergencia.",
      routineBefore: "En el escenario original, se encuentra una descripción del formato de trabajo en varias publicaciones obsoletas. El especialista responde manualmente a las preguntas repetidas y se asegura de que las respuestas coincidan con las reglas vigentes.",
      resultAfter: "Target Build Artifact: sección validada de preguntas sobre organización del trabajo y límites de comunicación. La recepción elimina diagnósticos y recomendaciones de tratamiento y dirige las solicitudes sensibles a un proceso acordado.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "FORMATO",
      nextStep: "En la ruta formativa pregunta por la palabra FORMATO y comprueba que la respuesta no sustituye a la ayuda profesional."
    },
    {
      id: 'student_18', roleId: 'a-novichok', name: "Julia", age: null, city: null,
      specialty: "Autor de un pequeño producto práctico.",
      headline: "Análisis de entrenamiento · instrucciones para la primera plantilla",
      quote: "El ejemplo del tutorial está dedicado a las instrucciones para una pequeña plantilla de trabajo. El lector de la prueba debe comprender los datos de entrada y verificar el resultado, y las promesas sofisticadas no sustituyen a los procedimientos claros.",
      taskBuiltIn3Evenings: "Tarea de estudio durante tres tardes por $19: describe el uso de una de tus propias plantillas. Las instrucciones incluyen un ejemplo completo, restricciones y señales mediante las cuales se verifica la preparación del resultado.",
      routineBefore: "En el guión original, el autor explica el uso del patrón a cada lector por separado. Se repiten las preguntas sobre cómo completar los campos, el procedimiento y verificar el documento de trabajo recibido.",
      resultAfter: "Artefacto de compilación de destino: instrucciones con ejemplo completo y criterios de autoevaluación. Las pruebas con un nuevo lector revelarán partes poco claras, pero no serán evidencia de ventas futuras.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "PLANTILLA",
      nextStep: "En la ruta de entrenamiento, solicite la palabra PATRÓN y siga las instrucciones de los datos de demostración sin que el autor se lo solicite."
    },
    {
      id: 'student_19', roleId: 'a-marketolog', name: "polina", age: null, city: null,
      specialty: "Comercializador de contenidos",
      headline: "Análisis educativo · caso sin números ficticios",
      quote: "Un ejemplo de capacitación muestra una revisión editorial de material sobre el trabajo completado. El borrador identifica los hechos confirmados y los resultados desconocidos por separado, por lo que las métricas faltantes no se reemplazan con números extravagantes.",
      taskBuiltIn3Evenings: "Tarea de formación durante tres tardes por $19: montar una estructura de caja con materiales homologados. Cada declaración está asociada con una fuente y los indicadores no respaldados se excluyen del texto terminado.",
      routineBefore: "En el escenario original, la información sobre el proyecto se recopila a partir de documentos de trabajo dispares. El editor verifica manualmente qué afirmaciones están verificadas y qué materiales pueden mostrarse públicamente.",
      resultAfter: "Artefacto objetivo de la asamblea: un borrador de caso con fuentes y límites claros de lo probado. La verificación elimina los indicadores no verificados y el derecho a publicar sigue siendo una condición obligatoria separada.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "CASO",
      nextStep: "En la ruta de aprendizaje pregunta por la palabra CASO y comprueba que no se queda ni una sola figura sin fuente."
    },
    {
      id: 'student_20', roleId: 'a-magazin', name: "miguel", age: null, city: null,
      specialty: "Estudio de servicio local",
      headline: "Análisis educativo · respuestas sobre grabación y transferencia",
      quote: "El estudio de caso describe las respuestas al escribir a un estudio de servicio local. Las condiciones de tiempo libre y traslado son confirmadas por el administrador, y la plantilla no crea una reserva inexistente.",
      taskBuiltIn3Evenings: "Tarea de estudio durante tres tardes por $19: preparar respuestas sobre grabación y transferencia. El cheque separa la solicitud del cliente de la hora confirmada y no promete grabación automática sin conexión.",
      routineBefore: "En el escenario original, el administrador repite manualmente las condiciones de entrada a los nuevos visitantes. Al realizar la transferencia, debe volver a verificar el cronograma y confirmar que el cambio realmente se realizó en el sistema de producción.",
      resultAfter: "Crear artefacto objetivo: plantillas de respuesta con confirmación separada del cambio de programación. La prueba verifica la ausencia de reservas falsas y el funcionamiento de la integración real se confirma mediante una verificación separada.",
      videoSrc: null, duration: null, durationSeconds: null, codeword: "TIEMPO",
      nextStep: "En la ruta de formación pide la palabra TIEMPO y comprueba que la solicitud no confirmada no se llama reserva."
    }
  ];

  const disclosure = "Un ejemplo de formación con carácter ficticio, no una reseña de un cliente real. Se describe un plan de montaje práctico, no un resultado verificado del estudiante.";
  window.COLIBRIOS_REVIEWS_20 = Object.freeze(cases.map(item => Object.freeze({
    ...item,
    roleLabel: roleLabels[item.roleId],
    posterSrc: 'assets/portraits/' + item.id + '.webp',
    audioSrc: null,
    mediaType: item.videoSrc ? 'role-avatar-video' : 'text-case',
    caseType: 'illustrative-educational-scenario',
    disclosure,
    identityStatus: 'persona-label-not-verified-customer',
    ageProvenance: item.age === null ? 'not-provided' : 'existing-voice-persona-production-brief',
    cityProvenance: 'not-provided',
    quoteKind: 'editorial-summary-not-verbatim-testimonial',
    isVerifiedTestimonial: false,
    completionVerified: false,
    resultStatus: 'acceptance-target-not-measured-outcome',
    codewordStatus: 'proposed-training-trigger-not-live-verified',
    videoTranscriptVerified: false,
    publicationStatus: 'draft-pending-editorial-and-media-approval',
    priceRUB: 990,
    evenings: 3
  })));

  window.COLIBRIOS_BROLL_SHOWCASE = Object.freeze([
    {
      id: 'broll_01', title: "Denys Viet junto a la piscina",
      caption: "Un fragmento vertical para familiarizarse con la presentación visual del proyecto. Este video no respalda el desempeño de los estudiantes ni la velocidad de finalización de las tareas laborales.",
      videoSrc: 'assets/videos/broll_01_dennis_pool_29s.mp4',
      posterSrc: 'assets/videos/broll_01_dennis_pool_29s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:29', durationSeconds: 28.6
    },
    {
      id: 'broll_02', title: "Tatiana Colibri · balcón",
      caption: "Fragmento vertical con Tatiana Colibri para el bloque sobre el proyecto. El clip es una presentación visual, no una prueba de ingresos o resultados para el cliente.",
      videoSrc: 'assets/videos/broll_02_tatiana_balcony_10s.mp4',
      posterSrc: 'assets/videos/broll_02_tatiana_balcony_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_03', title: "Denys Viet · cocina",
      caption: "Un breve fragmento vertical de la serie de viviendas del proyecto. Puede usarse como una interrupción, pero no puede hacerse pasar por una grabación de automatización probada.",
      videoSrc: 'assets/videos/broll_03_dennis_kitchen_10s.mp4',
      posterSrc: 'assets/videos/broll_03_dennis_kitchen_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_04', title: "Tatiana Colibri · marco de casa",
      caption: "Un breve fragmento vertical con Tatiana Colibri de la serie casera. Complementa la historia del proyecto sin promesas de ganancias ni indicadores de desempeño no confirmados.",
      videoSrc: 'assets/videos/broll_04_tatiana_sofa_10s.mp4',
      posterSrc: 'assets/videos/broll_04_tatiana_sofa_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_05', title: "Carrusel en vivo · primera opción",
      caption: "Un fragmento animado muestra una de las opciones de alimentación del carrusel. Este es un formato de muestra y no un respaldo de cobertura, solicitudes u operación de ruta de pago.",
      videoSrc: 'assets/videos/broll_05_living_carousel_s1.mp4',
      posterSrc: 'assets/videos/broll_05_living_carousel_s1.jpg',
      aspectRatio: '135:169', width: 540, height: 676,
      duration: '0:08', durationSeconds: 8.042667
    },
    {
      id: 'broll_06', title: "Carrusel en vivo · segunda opción",
      caption: "El segundo fragmento animado ayuda a comparar las opciones de alimentación del carrusel. El tamaño se indica según el archivo terminado y el resultado de la promoción no se midió en este ejemplo.",
      videoSrc: 'assets/videos/broll_06_living_carousel_s2.mp4',
      posterSrc: 'assets/videos/broll_06_living_carousel_s2.jpg',
      aspectRatio: '135:169', width: 540, height: 676,
      duration: '0:08', durationSeconds: 8.042667
    },
    {
      id: 'broll_07', title: "Denys Viet · serie casera",
      caption: "Otro fragmento vertical para transición entre secciones del sitio. No son comentarios del cliente y no reemplazan la revisión del flujo de trabajo mostrado.",
      videoSrc: 'assets/videos/broll_07_dennis_bedroom_10s.mp4',
      posterSrc: 'assets/videos/broll_07_dennis_bedroom_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    },
    {
      id: 'broll_08', title: "Denys Viet · transición de marco",
      caption: "El fragmento vertical completa la serie de interrupciones visuales del proyecto. El clip complementa la navegación de la historia, pero no proporciona prueba de ahorro de tiempo o dinero.",
      videoSrc: 'assets/videos/broll_08_dennis_hallway_10s.mp4',
      posterSrc: 'assets/videos/broll_08_dennis_hallway_10s.jpg',
      aspectRatio: '9:16', width: 540, height: 960,
      duration: '0:10', durationSeconds: 10.005
    }
  ].map(item => Object.freeze({
    ...item,
    mediaType: 'broll-showcase',
    evidenceType: 'format-demonstration-not-customer-proof',
    transcriptVerified: false,
    publicationStatus: 'existing-media-approval-not-certified-by-this-dataset'
  })));

  window.COLIBRIOS_REVIEWS_METADATA = Object.freeze({
    schemaVersion: '1.0.0',
    language: 'ru',
    brandName: "Tatiana Colibri y Denys Viet",
    title: "20 sesiones de formación en cinco roles",
    disclosure,
    quotePolicy: 'Editorial summaries are not customer quotations or video transcripts.',
    identityPolicy: 'Names are persona labels, not authenticated customer identities. Unknown ages and cities are null.',
    resultPolicy: 'Before/after fields describe a scenario and acceptance target, not measured outcomes.',
    durationPolicy: 'Measured container duration is in seconds. Text-only cards have no audio/video duration.',
    pathBase: 'project-root',
    publicationStatus: 'draft-pending-editorial-and-media-approval',
    mandatory5RoundsVerified: false,
    sourceRefs: Object.freeze([
      'goal-objective.md#3',
      'assets/config.js',
      'role_avatars_20261024/role_avatars_manifest.json',
      'role_avatars_20261024/distinct_voices_48k/voice_differentiation_receipt.json',
      'role_avatars_20261024/memo_voice_revision/content/memos.json',
      'notebooklm:9bb2ba3a-e275-4fe7-a03e-6595762ab87d/697783d7-330a-4f6f-8001-87b58787b2f5'
    ])
  });
})();
