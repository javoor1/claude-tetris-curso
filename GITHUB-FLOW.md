# Guía de GitHub Flow

Tutorial práctico para trabajar con issues, ramas y Pull Requests en este proyecto. Además de **qué** hacer, cada sección explica **por qué** se hace y **qué problema resuelve**. Incluye el flujo diario, administración del repositorio, casos de uso comunes y solución de problemas.

Las cajas con el título **Por qué** explican la razón de cada práctica. Si solo quieres los comandos, ve a la [chuleta](#10-chuleta-de-comandos).

## Índice

1. [Qué es GitHub Flow](#1-qué-es-github-flow)
2. [Configuración inicial](#2-configuración-inicial)
3. [El flujo paso a paso](#3-el-flujo-paso-a-paso)
4. [Convenciones](#4-convenciones)
5. [Administración del repositorio](#5-administración-del-repositorio)
6. [Casos de uso comunes](#6-casos-de-uso-comunes)
7. [Problemas frecuentes y soluciones](#7-problemas-frecuentes-y-soluciones)
8. [Automatización de issues (workflow del repo)](#8-automatización-de-issues-workflow-del-repo)
9. [Trabajar con Claude Code y las GitHub Actions](#9-trabajar-con-claude-code-y-las-github-actions)
10. [Chuleta de comandos](#10-chuleta-de-comandos)

---

## 1. Qué es GitHub Flow

GitHub Flow es una estrategia de ramificación (*branching strategy*) simple, pensada para equipos pequeños y entrega continua. Se basa en seis reglas:

1. `main` siempre está estable.
2. Todo cambio nace en una rama nueva creada desde `main`.
3. Cada rama tiene un nombre descriptivo.
4. Se hacen commits pequeños y frecuentes en la rama.
5. Se abre un Pull Request (PR) para pedir revisión y discutir el cambio.
6. Tras la aprobación, se hace merge a `main` y se borra la rama.

Cuando el trabajo parte de un issue, la práctica recomendada es **un issue, una rama, un PR**.

```
main      ●───────●───────────────●───────●
           \                     /
feature     ●──●──●──●──●──●────●   (PR + merge)
```

### Por qué cada regla existe

| Regla | Qué problema resuelve |
|-------|-----------------------|
| `main` siempre estable | Si `main` se rompe, nadie puede partir de una base fiable ni desplegar. Una `main` sana significa que siempre puedes abrir `index.html` y jugar. |
| Todo cambio en una rama nueva | Aísla el trabajo a medias. Puedes experimentar, equivocarte y abandonar sin afectar a nadie. Sin ramas, cada commit a medio hacer queda en la versión "oficial". |
| Nombre descriptivo | Con 10 ramas abiertas, `prueba2` no dice nada. Un buen nombre te dice qué contiene sin abrirla. |
| Commits pequeños y frecuentes | Si algo sale mal, puedes volver a un punto cercano. Un commit gigante que mezcla cinco cosas es imposible de revisar o deshacer parcialmente. |
| Pull Request | Es el punto de revisión: otra persona (o tú mismo, con calma) ve el cambio completo antes de que entre a `main`. Atrapa errores y deja registro de la discusión. |
| Merge y borrar la rama | Cierra el ciclo: el trabajo ya está en `main`, la rama ya cumplió su función. Ver [por qué se borran las ramas](#por-qué-se-borran-las-ramas). |

### Por qué este modelo y no otro

- **Git Flow** (`develop`, `release`, `hotfix`) está pensado para software con versiones numeradas y varias en mantenimiento a la vez. Aquí solo hay una versión (la última), así que añadiría ramas y ceremonias sin beneficio.
- **Trunk-based** (commits directos a `main`) funciona cuando hay tests automáticos que detectan roturas al instante. Este proyecto no los tiene: sin red de seguridad, cada commit directo es un riesgo.

GitHub Flow queda en el punto medio: poca estructura, pero con revisión antes de integrar.

### Por qué un issue, una rama, un PR

- **Trazabilidad:** puedes seguir una necesidad completa: problema (issue), solución (rama) y revisión (PR). En el futuro, `git log` y el PR te explican *por qué* se hizo un cambio.
- **Reversibilidad:** si un cambio resulta malo, revertir un PR pequeño y enfocado es trivial. Revertir uno que mezcla tres issues obliga a deshacer cosas buenas.
- **Revisión fácil:** un PR de 30 líneas sobre un solo tema se revisa bien. Uno de 600 líneas sobre cinco temas se aprueba "a ojo".

---

## 2. Configuración inicial

### Requisitos

- Git instalado.
- Cuenta de GitHub.
- GitHub CLI (`gh`), opcional pero muy recomendado: <https://cli.github.com>

### Configurar identidad y autenticación

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@correo.com"
gh auth login
```

> **Por qué:** cada commit guarda nombre y correo del autor. Sin esa configuración, Git rechaza el commit o usa datos incorrectos, y tus contribuciones no se asocian a tu cuenta de GitHub. `gh auth login` permite que la CLI cree issues y PRs en tu nombre sin pedirte contraseña cada vez.

### Clonar el repositorio

```bash
git clone https://github.com/<usuario>/claude-tetris-curso.git
cd claude-tetris-curso
```

> **Por qué:** `clone` descarga el historial completo y deja configurado el remoto `origin`. Trabajas en local (rápido y sin conexión) y sincronizas con GitHub cuando quieres.

### Comprobar el estado

```bash
git status
git branch -a      # ramas locales y remotas
git remote -v      # remotos configurados
```

> **Por qué:** antes de empezar conviene saber en qué rama estás y si hay cambios sin guardar. La mayoría de los desastres de Git vienen de actuar sin saber en qué estado estaba el repositorio.

---

## 3. El flujo paso a paso

### Paso 1: crear el issue

Un issue describe **qué** hay que hacer y **por qué**. Desde la web (pestaña *Issues → New issue*) o con la CLI:

```bash
gh issue create --title "Añadir tecla de pausa" --body "Pausar con la tecla P."
gh issue list
```

Un buen issue incluye:

- Descripción clara del problema o la mejora.
- Criterios de aceptación (cómo sabremos que está terminado).
- Etiquetas (`bug`, `enhancement`, `docs`).

> **Por qué:** escribir el problema antes de programar te obliga a definirlo. Evita el clásico "empecé a programar y a mitad de camino no sabía qué quería". Los criterios de aceptación resuelven la pregunta "¿ya terminé?". Además, el número del issue (`#2`) es el hilo que conecta rama, commits y PR.

### Paso 2: actualizar `main` local

Antes de crear una rama, parte siempre de un `main` actualizado:

```bash
git switch main
git pull origin main
```

> **Por qué:** si creas tu rama desde un `main` viejo, tu trabajo parte de una base desfasada. Cuando abras el PR, tendrás conflictos con cambios que ya existían. Dos comandos ahora evitan un rato de resolver conflictos después.

### Paso 3: crear la rama

Nombre con formato `tipo/numero-descripcion-corta`:

```bash
git switch -c feature/2-pausa-con-tecla-p
```

Atajo que además enlaza la rama con el issue en GitHub:

```bash
gh issue develop 2 --checkout
```

> **Por qué:** la rama es el espacio aislado donde trabajas. Sin ella, tus commits a medias entrarían en `main`. Con el número de issue en el nombre, cualquiera sabe qué problema ataca esa rama sin abrirla. `gh issue develop` hace además que el issue muestre la rama enlazada en la sección *Development*.

### Paso 4: trabajar y hacer commits

```bash
git status
git add game.js
git commit -m "Añade manejo de la tecla P para pausar"
```

Recomendaciones:

- Commits pequeños, cada uno con un propósito.
- Mensajes en imperativo y específicos (ver [convenciones](#4-convenciones)).
- Revisa lo que vas a confirmar con `git diff --staged`.

> **Por qué:** cada commit es un punto de guardado al que puedes volver. Si el cuarto commit rompe algo, regresas al tercero sin perder todo el trabajo. `git add` por archivo (y no `git add .` a ciegas) evita colar por accidente archivos que no querías. `git diff --staged` es la última revisión antes de que el cambio quede en el historial.

### Paso 5: subir la rama

La primera vez, con seguimiento (`-u`):

```bash
git push -u origin feature/2-pausa-con-tecla-p
```

Después basta con `git push`.

> **Por qué:** hasta que haces `push`, tu trabajo existe solo en tu disco. Si el equipo se estropea, lo pierdes. Subir la rama te da respaldo y es requisito para abrir un PR. El `-u` recuerda la relación entre tu rama local y la remota, así que luego `git push` y `git pull` funcionan sin argumentos.

### Paso 6: abrir el Pull Request

```bash
gh pr create --title "Añade pausa con tecla P" --body "Closes #2"
```

Incluir `Closes #2` (o `Fixes #2`, `Resolves #2`) en la descripción **cierra el issue automáticamente** al hacer merge.

Puedes abrir el PR como borrador (*draft*) si el trabajo aún no está listo:

```bash
gh pr create --draft
```

> **Por qué:** el PR es una *propuesta* de integrar tu rama en `main`, no la integración en sí. Da un espacio para revisar el diff, comentar y ejecutar comprobaciones automáticas **antes** de que el cambio sea definitivo. `Closes #2` resuelve el olvido de cerrar issues a mano y deja el vínculo issue-PR para siempre. El modo borrador avisa "aún no lo revises" y permite compartir trabajo en progreso o activar CI pronto.

### Paso 7: revisión

- El revisor comenta, pide cambios o aprueba.
- Para responder a comentarios, haz nuevos commits en la misma rama y súbelos. El PR se actualiza solo.
- Resuelve las conversaciones una vez atendidas.

> **Por qué:** una segunda mirada detecta lo que el autor ya no ve (errores, casos olvidados, código confuso). Aunque trabajes solo, revisar tu propio PR con calma, leyendo el diff completo, atrapa errores que pasaron desapercibidos al escribir. Los cambios se hacen en la misma rama para que toda la conversación quede en un único PR.

### Paso 8: merge

Desde la web (botón *Merge*) o con la CLI:

```bash
gh pr merge --merge     # merge commit
gh pr merge --squash    # un solo commit
gh pr merge --rebase    # historia lineal
```

Ver [tipos de merge](#tipos-de-merge-y-cuál-elegir).

> **Por qué:** el merge es el momento en que el cambio pasa a formar parte oficial de `main`. Hacerlo desde el PR (y no con `git merge` local seguido de `push`) garantiza que se respeten las reglas de protección y que el PR quede marcado como *Merged*, cerrando el issue enlazado.

### Paso 9: limpiar

```bash
git switch main
git pull origin main
git branch -d feature/2-pausa-con-tecla-p      # borra la local
git push origin --delete feature/2-pausa-con-tecla-p   # borra la remota (si no se borró sola)
git fetch --prune                               # limpia referencias remotas obsoletas
```

#### Por qué se borran las ramas

Esta es la duda más común, así que merece explicación aparte.

**Qué se borra realmente:** una rama es solo un puntero (una etiqueta) que apunta a un commit. Borrarla elimina la etiqueta, **no los commits**. Tras el merge, esos commits ya forman parte del historial de `main`, así que no se pierde nada. Puedes volver a cualquiera con `git log` y `git switch -c rescate <hash>`.

**Qué problemas resuelve borrarlas:**

- **Ruido y confusión:** después de 6 meses habría cientos de ramas muertas. Cuando ejecutas `git branch -a`, no puedes distinguir cuáles tienen trabajo vivo y cuáles ya terminaron.
- **Riesgo de reutilizar una rama vieja:** si sigues trabajando en una rama ya mergeada, puedes crear conflictos raros o tener un PR que arrastra commits que ya están en `main`.
- **Señal de estado:** si una rama existe, significa "hay trabajo pendiente aquí". Borrar las terminadas convierte la lista de ramas en una lista de pendientes real.
- **Claridad para otros:** quien clone el repo ve solo lo relevante.

**Qué pasa si te equivocas:** los commits siguen en `main`. Y si borraste una rama *sin* mergear, aún puedes recuperarla con `git reflog` durante un tiempo (ver [problemas frecuentes](#borré-una-rama-sin-mergear)).

**Excepción importante con squash merge:** si usas *Squash and merge*, los commits individuales de la rama **no** pasan a `main` (solo un commit combinado). Siguen visibles en el PR cerrado en GitHub, pero no en `git log` de `main`. Si te importa conservar cada commit, usa merge commit o rebase.

**Por qué los otros comandos de limpieza:**

- `git switch main` + `git pull`: te deja en una `main` actualizada que ya incluye tu cambio, lista para el siguiente issue.
- `git branch -d` (minúscula): borra solo si la rama está mergeada. Es una protección: si olvidaste mergear algo, Git se niega y evita perder trabajo. `-D` fuerza el borrado y no avisa.
- `git push origin --delete`: la rama remota es una copia aparte; borrar la local no la elimina. (Si activas el borrado automático, GitHub lo hace por ti.)
- `git fetch --prune`: Git conserva referencias locales a ramas remotas aunque ya no existan en GitHub (aparecen como `remotes/origin/...`). `--prune` las limpia para que tu lista refleje la realidad.

---

## 4. Convenciones

> **Por qué hay convenciones:** el repositorio lo leen personas (tú dentro de tres meses incluido) y también herramientas. Cuando todos usan el mismo formato, se puede buscar, filtrar y automatizar. Sin convención, cada rama y cada commit tiene un estilo distinto y todo cuesta más de entender.

### Nombres de ramas

| Prefijo     | Uso                          | Ejemplo                          |
|-------------|------------------------------|----------------------------------|
| `feature/`  | Funcionalidad nueva          | `feature/2-pausa-con-tecla-p`    |
| `fix/`      | Corrección de un bug         | `fix/5-colision-en-borde`        |
| `docs/`     | Documentación                | `docs/7-actualizar-readme`       |
| `refactor/` | Reestructurar sin cambiar comportamiento | `refactor/9-separar-render` |
| `chore/`    | Mantenimiento, configuración | `chore/11-actualizar-workflow`   |

Reglas: minúsculas, guiones en lugar de espacios, número de issue al inicio, descripción corta.

> **Por qué cada parte del formato `tipo/numero-descripcion`:**
>
> - **Tipo:** dice la naturaleza del cambio de un vistazo. Una rama `fix/` pide más cuidado con regresiones; una `docs/` casi no tiene riesgo. Además, los clientes Git y GitHub agrupan las ramas por prefijo (`feature/`, `fix/`) como si fueran carpetas.
> - **Número de issue:** enlaza la rama con su motivo. Resuelve la pregunta "¿por qué existe esta rama?".
> - **Descripción corta:** resuelve la pregunta "¿de qué va?" sin abrir el issue.
> - **Minúsculas y guiones:** evitan problemas con sistemas de archivos que distinguen mayúsculas (Linux) y con los que no (Windows/macOS), y los espacios obligan a poner comillas en cada comando.

### Mensajes de commit

Formato sugerido (Conventional Commits simplificado):

```
tipo: resumen corto en imperativo (máx. ~50 caracteres)

Cuerpo opcional que explica el porqué, no el qué.
```

Ejemplos:

```
feat: añade pausa con la tecla P
fix: corrige colisión de la pieza en el borde derecho
docs: documenta los controles en el README
```

> **Por qué:**
>
> - **Resumen corto:** `git log --oneline` muestra una línea por commit. Si es larga, se corta y deja de ser útil.
> - **Imperativo** ("añade", no "añadido"): lee como una instrucción de lo que el commit *hace* al aplicarse, y es el estilo del propio Git (`Merge branch...`, `Revert...`).
> - **Explicar el porqué en el cuerpo:** el *qué* ya lo muestra el diff. Lo que se pierde con el tiempo es la razón, y es lo que más necesitarás cuando preguntes "¿por qué se hizo así?".
> - **Prefijo de tipo:** permite filtrar el historial (`git log --grep "^fix"`) y generar changelogs automáticamente.

### Descripción de un PR

Debe responder:

- Qué cambia y por qué.
- Cómo probarlo.
- Qué issue cierra (`Closes #N`).

> **Por qué:** el revisor no estuvo en tu cabeza mientras programabas. Sin contexto, tiene que adivinar la intención y reconstruir cómo probarlo, lo que retrasa la revisión o la vuelve superficial. Tres líneas bien escritas ahorran decenas de preguntas.

### Tipos de merge y cuál elegir

| Tipo                  | Resultado en `main`                        | Cuándo usarlo                                   |
|-----------------------|--------------------------------------------|-------------------------------------------------|
| **Merge commit**      | Conserva todos los commits + un commit de merge | Quieres preservar el historial completo de la rama |
| **Squash and merge**  | Un solo commit con todos los cambios       | La rama tiene muchos commits ruidosos ("wip", "arreglo") |
| **Rebase and merge**  | Commits reaplicados linealmente, sin commit de merge | Quieres historia lineal conservando commits |

> **Por qué existen tres:** cada uno resuelve un problema distinto del historial.
>
> - **Merge commit** resuelve "no quiero perder nada". Es fiel y seguro, pero el historial se llena de commits de merge y de ramas entrelazadas.
> - **Squash** resuelve "mis commits intermedios son basura". Deja un commit limpio por PR, ideal si hiciste "wip", "typo", "arreglo otra vez". El costo: pierdes la granularidad de los commits originales en `main`.
> - **Rebase** resuelve "quiero una línea recta". Cada commit se conserva y el historial se lee de arriba abajo, pero reescribe los commits (nuevos hashes), lo que lo hace más delicado.
>
> **Recomendación para este proyecto:** *Squash and merge*. Los PRs son pequeños, un issue = un commit en `main`, y el historial queda como una lista de cambios entendibles. Elige uno, configúralo como predeterminado y mantén la política.

> **Atención con squash:** los commits originales de la rama ya no aparecen en `main`. Siguen visibles en el PR cerrado, pero no en `git log` de `main`. Si necesitas poder volver a commits individuales, usa merge commit o rebase.

---

## 5. Administración del repositorio

Esta sección cubre la configuración que mantiene `main` sano.

> **Por qué hace falta:** las buenas prácticas que dependen de la memoria o la disciplina fallan tarde o temprano (un día con prisa, un `git push` directo "solo esta vez"). Las reglas del repositorio convierten la disciplina en algo que la plataforma **hace cumplir**.

### Proteger `main`

*Settings → Rules → Rulesets → New ruleset → New branch ruleset*, apuntando a la rama predeterminada (`main`). Reglas recomendadas:

- **Require a pull request before merging**
- **Block force pushes**
- **Restrict deletions**

Opcionales según el proyecto: *Require status checks to pass* (cuando haya CI), *Require linear history* (si solo usas squash o rebase).

> **Por qué cada regla:**
>
> - **Require a pull request:** sin ella, un `git push origin main` apresurado salta toda la revisión. Esta regla hace imposible el atajo, incluso para ti. Resuelve el "lo subo directo, es solo un cambio pequeño" que acaba rompiendo `main`.
> - **Block force pushes:** `git push --force` reescribe el historial remoto. En `main` puede borrar commits de otras personas sin aviso. Bloquearlo garantiza que el historial de `main` solo crece.
> - **Restrict deletions:** evita borrar `main` por accidente (un `git push origin --delete` mal dirigido).
> - **Require status checks:** hace que los tests o el CI deban pasar antes de mergear. Resuelve "mergeé sin darme cuenta de que fallaba". Aquí no tienes CI todavía, por eso es opcional.
> - **Require linear history:** impide commits de merge, forzando squash o rebase. Resuelve un historial lleno de bifurcaciones.
>
> **Reglas que no conviene activar aquí:** *Restrict updates* bloquearía también los merges de tus propios PRs. *Signed commits*, *code scanning* y *coverage* añaden fricción sin beneficio en un proyecto pequeño sin esa infraestructura.
>
> **Aprobaciones requeridas:** si trabajas solo, déjalas en `0`: GitHub no permite aprobar tu propio PR y quedarías bloqueado. Con equipo, `1` es lo razonable.
>
> **Efecto secundario a recordar:** con la regla activa, `git push origin main` será rechazado. Es lo esperado, no un error.

### Borrado automático de ramas

*Settings → General → Pull Requests → Automatically delete head branches*.

> **Por qué:** el paso de limpieza depende de que te acuerdes. Con esta opción, GitHub borra la rama remota en cuanto el PR se mergea, así que nunca se acumulan ramas muertas. Resuelve el problema de las 40 ramas viejas que nadie se atreve a borrar. (Ver [por qué se borran](#por-qué-se-borran-las-ramas).)

### Tipo de merge permitido

En *Settings → General → Pull Requests* puedes habilitar solo los tipos de merge que quieras usar, y elegir el predeterminado.

> **Por qué:** si los tres tipos están habilitados, cada PR depende del humor del momento y el historial queda inconsistente (unos con commit de merge, otros aplastados). Limitar la opción a una sola hace que el historial siga una regla fija.

### Etiquetas y organización de issues

- Usa etiquetas (`bug`, `enhancement`, `docs`, `good first issue`).
- Usa *Milestones* para agrupar issues por objetivo.
- Usa *Projects* (tablero Kanban) si quieres seguimiento visual.

> **Por qué:** con 5 issues basta una lista, pero con 50 necesitas filtrar. Las etiquetas responden "¿qué bugs hay abiertos?"; los milestones, "¿qué falta para la versión 1.0?"; el tablero, "¿qué se está haciendo ahora?". Resuelven la pérdida de visibilidad a medida que el proyecto crece.

### Plantillas

Crea plantillas para homogeneizar la información:

- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/pull_request_template.md`

Ejemplo de `pull_request_template.md`:

```markdown
## Qué cambia
<!-- Resumen del cambio -->

## Cómo probarlo
<!-- Pasos -->

## Issue relacionado
Closes #
```

> **Por qué:** sin plantilla, los issues llegan como "no funciona" sin más datos y los PRs sin descripción. La plantilla pregunta por lo que normalmente se olvida (pasos para reproducir, cómo probar, issue relacionado) y te ahorra el ida y vuelta de pedir esa información después.

### Etiquetas de versión (tags)

Para marcar versiones estables:

```bash
git tag -a v1.0.0 -m "Primera versión estable"
git push origin v1.0.0
```

> **Por qué:** una rama se mueve con cada commit; un tag **no se mueve**, apunta siempre al mismo punto. Resuelve "¿cómo vuelvo exactamente a la versión que funcionaba el día del lanzamiento?". Es también lo que GitHub usa para crear *Releases* descargables.

### Mantenimiento periódico

```bash
git fetch --prune                  # elimina referencias a ramas remotas borradas
git branch --merged main           # ramas locales ya mergeadas (candidatas a borrar)
git branch -vv                     # ramas locales y su seguimiento remoto
```

> **Por qué:** Git no limpia solo. Estos comandos detectan ramas olvidadas y referencias obsoletas. Una pasada ocasional evita que tu entorno local se llene de residuos y te confunda sobre qué está activo.

---

## 6. Casos de uso comunes

### 6.1 Mantener mi rama al día con `main`

Si `main` avanzó mientras trabajabas:

```bash
git fetch origin
git merge origin/main
```

Alternativa con historia más limpia (solo si la rama es **solo tuya** y aún no la han usado otros):

```bash
git fetch origin
git rebase origin/main
git push --force-with-lease
```

> **Por qué:** cuanto más tiempo vive tu rama sin sincronizarse, más se aleja de `main` y más conflictos acumulas, todos juntos al final. Integrar `main` en tu rama con frecuencia reparte el esfuerzo en pequeñas dosis.
>
> **Merge vs rebase:** `merge` es más seguro (no reescribe nada) pero añade un commit de merge. `rebase` reaplica tus commits sobre la punta de `main`, dejando historia lineal, pero **reescribe commits**: por eso necesita `--force-with-lease` al subir y solo es seguro en ramas que nadie más usa. `--force-with-lease` falla si alguien subió algo a esa rama que tú no has visto, a diferencia de `--force`, que lo pisaría sin avisar.

### 6.2 Cambiar de rama sin perder trabajo a medias

Guarda temporalmente los cambios con `stash`:

```bash
git stash push -m "trabajo a medias"
git switch otra-rama
# ... haces lo que necesites ...
git switch rama-original
git stash pop
```

Ver lo guardado: `git stash list`.

> **Por qué:** Git no te deja cambiar de rama si tus cambios sin confirmar chocarían con la otra rama, y tampoco quieres hacer un commit de algo a medias. `stash` los aparta en un cajón temporal y deja el directorio limpio. Resuelve la interrupción típica: "estoy a mitad de algo y llega un bug urgente".

### 6.3 Corregir el último commit

Cambiar el mensaje o añadir un archivo olvidado (solo si **no** lo has subido aún):

```bash
git add archivo-olvidado.js
git commit --amend
```

Si ya lo subiste a una rama personal: `git push --force-with-lease`.

> **Por qué:** es más limpio un solo commit correcto que "Añade pausa" seguido de "Olvidé un archivo". `--amend` reescribe el último commit (nuevo hash), por eso solo es seguro antes de compartirlo: si otras personas ya lo tienen, reescribirlo les causa conflictos.

### 6.4 Deshacer cambios

| Situación                                         | Comando                              |
|---------------------------------------------------|--------------------------------------|
| Descartar cambios sin confirmar de un archivo     | `git restore archivo`                |
| Sacar un archivo del *staging*                    | `git restore --staged archivo`       |
| Deshacer el último commit conservando los cambios | `git reset --soft HEAD~1`            |
| Deshacer el último commit y descartar cambios     | `git reset --hard HEAD~1` (destructivo) |
| Deshacer un commit **ya publicado**               | `git revert <hash>` (crea commit inverso) |

> **Por qué hay tantas opciones:** "deshacer" significa cosas distintas según *dónde* está el cambio (disco, staging, commit local, commit publicado).
>
> **Por qué `revert` y no `reset` en commits publicados:** `reset` reescribe el historial, lo que rompe la copia de cualquiera que ya lo tenga. `revert` es un commit nuevo que invierte al anterior, así que el historial solo crece y nadie sale perjudicado. Regla: **historia compartida, `revert`; historia solo tuya, `reset`**.
>
> **Por qué `reset --hard` es peligroso:** descarta los cambios sin confirmar y no hay papelera. Los commits aún se pueden recuperar con `git reflog`, pero los cambios sin commit no.

### 6.5 Volver a un commit antiguo

```bash
git log --oneline              # localizar el hash
git switch -c rescate <hash>   # crear rama desde ese punto
```

Para solo mirar sin crear rama: `git checkout <hash>` (queda en *detached HEAD*; vuelve con `git switch main`).

> **Por qué una rama nueva:** al situarte en un commit suelto, cualquier commit nuevo que hagas no pertenece a ninguna rama y se pierde fácilmente al cambiar. Crear una rama `rescate` le da un nombre a ese punto y te permite trabajar sin riesgo. Esto también demuestra por qué borrar ramas mergeadas no es peligroso: cualquier commit del historial se puede volver a convertir en rama.

### 6.6 Traer un solo commit de otra rama

```bash
git cherry-pick <hash>
```

> **Por qué:** a veces necesitas un arreglo concreto que está en otra rama, sin traer el resto del trabajo. `cherry-pick` copia ese único commit. Úsalo con moderación: crea un duplicado con otro hash, y abusar de él genera historia confusa.

### 6.7 Resolver conflictos de merge

Ocurre cuando dos ramas modifican las mismas líneas.

1. Intenta el merge: `git merge origin/main`.
2. Git avisa de los archivos en conflicto: `git status`.
3. Abre cada archivo y busca los marcadores:

```
<<<<<<< HEAD
tu versión
=======
la versión de main
>>>>>>> origin/main
```

4. Edita dejando el resultado correcto y borra los marcadores.
5. Marca como resuelto y confirma:

```bash
git add archivo.js
git commit
```

Para abortar y volver al estado previo: `git merge --abort`.

> **Por qué ocurren:** Git fusiona automáticamente cuando los cambios tocan partes distintas. Cuando dos personas modifican las **mismas líneas**, no puede decidir cuál es la correcta, y esa decisión requiere criterio humano. Los marcadores `<<<<<<<` son Git diciéndote "aquí discrepan, decide tú". No son un error ni una señal de que hiciste algo mal.
>
> **Por qué conviene sincronizar a menudo:** los conflictos pequeños y frecuentes son fáciles; uno gigante tras dos semanas es doloroso. Ver [6.1](#61-mantener-mi-rama-al-día-con-main).

### 6.8 Trabajar con varios issues a la vez

Cada issue tiene su propia rama, siempre desde `main`:

```bash
git switch main && git pull
git switch -c fix/5-colision-en-borde
```

No encadenes ramas (una rama sobre otra) salvo que dependas realmente del otro cambio. Si dependes, indícalo en la descripción del PR y mergea primero el anterior.

> **Por qué desde `main` y no desde otra rama de trabajo:** si la rama B nace de la rama A, el PR de B incluye también los commits de A. Si A cambia o se rechaza, B se contamina. Ramas independientes se pueden revisar, aprobar y revertir por separado.

### 6.9 Contribuir a un repositorio ajeno (fork)

```bash
gh repo fork <dueño>/<repo> --clone
cd <repo>
git remote add upstream https://github.com/<dueño>/<repo>.git
git fetch upstream
git switch -c feature/mi-cambio upstream/main
```

Luego abre el PR desde tu fork hacia el repositorio original.

> **Por qué:** en un repositorio ajeno no tienes permiso de escritura. El *fork* es tu copia propia donde sí puedes subir ramas. El remoto `upstream` apunta al original para que puedas traer sus novedades y partir de su `main` actualizado, no del de tu copia desfasada.

### 6.10 Cerrar un issue sin código

```bash
gh issue close 3 --comment "Duplicado de #2"
```

> **Por qué:** no todo issue termina en un cambio de código (duplicados, ideas descartadas, preguntas respondidas). Cerrarlos con un comentario que explique el motivo mantiene limpia la lista de pendientes y deja constancia de la decisión.

### 6.11 Revisar el PR de otra persona en local

```bash
gh pr checkout 12
```

> **Por qué:** leer un diff en la web no siempre basta; a veces necesitas ejecutar el código. Este comando descarga la rama del PR y te cambia a ella en un paso, sin configurar remotos a mano.

### 6.12 Hotfix urgente

El flujo es el mismo, solo con prioridad:

```bash
git switch main && git pull
git switch -c fix/15-crash-al-iniciar
# arreglar, commit, push
gh pr create --title "Arregla crash al iniciar" --body "Closes #15"
```

No hace falta una rama especial: GitHub Flow trata todo cambio igual.

> **Por qué no saltarse el proceso:** con prisa es cuando más se cometen errores. Un PR pequeño para el arreglo urgente sigue dando una revisión rápida y deja el registro de qué se tocó y por qué. En Git Flow existe una rama `hotfix` aparte; GitHub Flow no la necesita porque `main` siempre es desplegable.

---

## 7. Problemas frecuentes y soluciones

### `error: pathspec '...' did not match any file(s) known to git`

Causa: el nombre de la rama es incorrecto (falta un prefijo) o no la tienes localmente.

```bash
git fetch
git branch -a                       # ver el nombre completo
git checkout claude/issue-2-20261006-1735   # usa el nombre COMPLETO con prefijo
```

> **Por qué pasa:** `git checkout` busca un nombre exacto. Si la rama es `claude/issue-2-...` y escribes `issue-2-...`, Git no encuentra nada con ese nombre. Los prefijos con `/` son parte del nombre, no una carpeta opcional. Además, una rama remota que nunca descargaste no existe en tu copia hasta hacer `git fetch`.

### `fatal: A branch named '...' already exists`

La rama ya existe. Cámbiate a ella con `git switch nombre` o elige otro nombre.

> **Por qué:** dos ramas no pueden compartir nombre. Si esa rama es de un intento anterior ya mergeado, bórrala (`git branch -d`) y crea una nueva, para no arrastrar historia vieja.

### `error: failed to push some refs ... (non-fast-forward)`

Causa: la rama remota tiene commits que no tienes.

```bash
git pull --rebase origin <rama>
git push
```

> **Por qué pasa:** Git solo acepta un `push` si puede añadir tus commits **encima** de lo que hay en remoto. Si alguien (o tú desde otro equipo) subió algo antes, tu historia y la remota divergieron. Git se niega para no pisar esos commits. `pull --rebase` trae lo remoto y coloca tus commits encima, lo que hace el `push` posible.

### `Your local changes would be overwritten by checkout/merge`

Tienes cambios sin confirmar que chocarían. Opciones:

```bash
git stash push -m "temporal"    # guardarlos
# hacer el cambio de rama o merge
git stash pop                   # recuperarlos
```

o bien confirma los cambios con un commit.

> **Por qué:** es una protección. Git prefiere negarse antes que sobrescribir trabajo tuyo no guardado en ningún commit (que no podría recuperar).

### Estoy en *detached HEAD*

Estás en un commit suelto, no en una rama. Si no hiciste cambios: `git switch main`. Si hiciste commits que quieres conservar:

```bash
git switch -c nombre-nueva-rama
```

> **Por qué es un riesgo:** en ese estado, los commits nuevos no pertenecen a ninguna rama. Al cambiar de sitio, quedan huérfanos y solo se recuperan con `git reflog`. Ponerles una rama les da una referencia estable.

### Hice commits en `main` por error

Antes de hacer push:

```bash
git branch feature/mi-cambio      # la nueva rama apunta a tus commits
git reset --hard origin/main      # main vuelve al estado remoto (destructivo en main local)
git switch feature/mi-cambio
```

Verifica con `git log` antes del `reset --hard`.

> **Por qué este orden:** primero creas la rama (que "guarda" tus commits con una etiqueta) y solo después mueves `main` hacia atrás. Si hicieras el `reset` primero, tus commits quedarían sin etiqueta y difíciles de encontrar. Como la protección de `main` bloquea el push, este error se queda en tu máquina y se corrige sin consecuencias.

### Push directo a `main` rechazado

Es la protección de rama funcionando. Mueve tus commits a una rama (ver caso anterior) y abre un PR.

> **Por qué es bueno:** es justo el problema que la regla debía evitar. No es un fallo de tu configuración.

### El PR tiene conflictos

Actualiza tu rama con `main` (ver [6.1](#61-mantener-mi-rama-al-día-con-main)), resuelve los conflictos (ver [6.7](#67-resolver-conflictos-de-merge)) y haz push. El PR se actualiza solo.

> **Por qué:** GitHub no puede mergear automáticamente si `main` cambió las mismas líneas que tu rama. La corrección se hace en tu rama (no en `main`) para que el PR resuelto ya llegue limpio.

### Borré una rama sin mergear

Los commits siguen en el repositorio un tiempo:

```bash
git reflog                        # buscar el hash del último commit de esa rama
git switch -c recuperada <hash>
```

Git los elimina definitivamente con la recolección de basura, normalmente tras varias semanas.

> **Por qué se puede recuperar:** borrar una rama solo quita la etiqueta; los commits siguen almacenados hasta que Git los limpia por no tener referencias. `reflog` es el diario de adónde ha apuntado `HEAD`, y por eso conserva el hash que necesitas. Por eso `git branch -d` (minúscula) se niega a borrar ramas sin mergear: es el aviso previo.

### Confirmé un secreto (contraseña, token, clave API)

1. **Revoca y rota el secreto de inmediato.** Es el paso más importante: asume que está comprometido.
2. Quitarlo del historial es secundario. Si el commit ya se subió, otros pudieron haberlo copiado.
3. Para limpiar el historial se usa `git filter-repo` o BFG Repo-Cleaner, y requiere force push; coordina con el equipo.

> **Por qué la prioridad es revocar y no borrar:** Git es un registro permanente. Aunque borres el archivo en un commit nuevo, el secreto sigue en los commits anteriores. Y si el repositorio es público, hay bots que rastrean GitHub buscando claves en minutos. Lo único seguro es invalidar la clave.

### Subí un archivo grande o innecesario

Añádelo a `.gitignore` y deja de rastrearlo:

```bash
echo "archivo-o-carpeta" >> .gitignore
git rm --cached archivo
git commit -m "chore: deja de rastrear archivo"
```

> **Por qué `git rm --cached`:** `.gitignore` solo afecta a archivos **aún no rastreados**. Si Git ya los sigue, hay que decirle explícitamente que los suelte. `--cached` los quita del repositorio pero **conserva el archivo en tu disco**.

### Mi rama local y la remota divergieron

```bash
git fetch
git status                         # indica cuántos commits difieren
git pull --rebase origin <rama>    # integra los cambios remotos
```

> **Por qué:** pasa cuando hay commits distintos a ambos lados (por ejemplo, trabajaste desde dos equipos). `fetch` + `status` te permite *ver* la situación antes de actuar, en lugar de hacer `pull` a ciegas.

### Hice `git push --force` y rompí la rama de otra persona

Prevención: usa siempre `--force-with-lease` en lugar de `--force`, y nunca en `main`. Para recuperar, quien tenga el estado anterior puede volver a subirlo, o se puede restaurar desde `git reflog` si la tenías en local.

> **Por qué:** `--force` sobrescribe la rama remota sin mirar qué había, borrando los commits de otros. `--force-with-lease` comprueba antes que nadie subió algo nuevo y, si es así, falla en lugar de pisarlo.

### Los finales de línea cambian en todo el archivo (Windows)

```bash
git config --global core.autocrlf true
```

Considera añadir un archivo `.gitattributes` con `* text=auto` al repositorio.

> **Por qué:** Windows termina las líneas con `CRLF` y Linux/macOS con `LF`. Si cada editor usa uno distinto, Git ve **todas** las líneas como modificadas y el diff se vuelve ilegible. `autocrlf` y `.gitattributes` normalizan el formato para que solo se vean los cambios reales.

### Ramas remotas que ya no existen aparecen en `git branch -a`

```bash
git fetch --prune
```

> **Por qué:** Git guarda una copia local del estado de cada rama remota y no la borra por sí solo cuando desaparece en GitHub. `--prune` sincroniza esa lista con la realidad.

---

## 8. Automatización de issues (workflow del repo)

El repositorio incluye `.github/workflows/issue-formatter.yml`. Se ejecuta cada vez que un issue se **abre** o se **edita** y hace tres cosas.

### 1. Normaliza el título

Quita espacios sobrantes, el punto final y prefijos como `[Bug]` o `fix:`, y pone mayúscula inicial.

> **Por qué:** los títulos de issues se vuelven el vocabulario del proyecto (aparecen en listas, en PRs y en el nombre de la rama). Si cada uno tiene un estilo distinto ("arreglar bug!!", "[BUG] colisión.", "colisión"), la lista es difícil de leer y buscar. Se quitan los prefijos porque esa información ya la lleva el *label*, y duplicarla en el título es ruido.

### 2. Asigna un label de tipo

`enhancement`, `bug`, `documentation`, `refactor` o `chore`, según palabras clave en el título (y en el cuerpo como respaldo). Si el label no existe, lo crea. Si el issue ya tiene uno de esos labels, no lo cambia.

> **Por qué:** los labels permiten filtrar ("muéstrame todos los bugs abiertos") y dan una vista de cuánto trabajo es de cada tipo. Etiquetar a mano es un paso que se olvida; automatizarlo garantiza que ningún issue quede sin clasificar. **No pisa un label existente** porque si tú lo pusiste a mano, tu criterio es mejor que una regla por palabras clave.
>
> **Limitación a tener en cuenta:** al ser reglas por palabras, puede equivocarse (por ejemplo, un título sin pistas cuyo cuerpo mencione "documentar" se etiqueta como `docs`). Si pasa, corrige el label a mano y el workflow respetará tu cambio.

### 3. Sugiere el nombre de la rama

Publica un comentario con la rama en formato `tipo/numero-descripcion-corta` y los comandos para crearla. Si el issue se edita, actualiza ese mismo comentario en lugar de añadir otro.

> **Por qué:** la [convención de nombres](#4-convenciones) solo sirve si se sigue siempre, y calcular el nombre cada vez (tipo, número, resumen en minúsculas y sin acentos) es tedioso y propenso a errores. Con el nombre ya calculado y los comandos listos para copiar, seguir la convención es *más fácil* que ignorarla. **Se actualiza el mismo comentario** para no llenar el issue de avisos repetidos cada vez que editas el título.

### Por qué es un script y no Claude

El workflow usa reglas deterministas (`actions/github-script`), no IA.

> **Por qué:** clasificar un issue por palabras clave es una tarea mecánica. Un script es instantáneo, gratuito, da siempre el mismo resultado para la misma entrada y no necesita secretos ni tokens. Reservar a Claude para tareas que requieren razonamiento (implementar el issue, revisar un PR) es más eficiente. Si algún día las reglas se quedan cortas, se puede sustituir esta parte por una llamada a Claude.

### Detalles técnicos que evitan problemas

- **`permissions: issues: write`:** el workflow recibe solo el permiso que necesita (principio de mínimo privilegio). Si el workflow tuviera un fallo, el daño posible queda acotado.
- **`concurrency` por número de issue:** si editas el issue varias veces seguidas, solo se ejecuta la última pasada. Evita ejecuciones simultáneas que se pisen entre sí o dupliquen el comentario.
- **Sin bucle infinito:** cuando el workflow edita el título, esa edición la hace el `GITHUB_TOKEN`, y GitHub **no dispara workflows por acciones de ese token**. Sin esta regla, el workflow se llamaría a sí mismo sin parar.
- **Idempotencia:** ejecutar el workflow dos veces sobre el mismo issue da el mismo resultado (no duplica labels ni comentarios). Esto hace seguro que se dispare con cada edición.

---

## 9. Trabajar con Claude Code y las GitHub Actions

Este repositorio tiene dos workflows de Claude Code en `.github/workflows/`: `claude.yml` (asistente que responde a menciones `@claude`) y `claude-code-review.yml` (revisión de PRs).

### Cómo encaja en el flujo

- Mencionar `@claude` en un issue o en un comentario de PR puede disparar al asistente, que trabaja en una rama propia.
- Las ramas deben seguir la convención del proyecto (`tipo/numero-descripcion-corta`, la misma que sugiere el issue-formatter), porque `claude.yml` se lo indica en el `prompt`. Sin esa instrucción, el action usa un nombre generado como `claude/issue-2-20261006-1735` (así son las ramas antiguas).
- El resultado llega como un PR normal: **revísalo igual que el de cualquier persona** antes de mergear.

> **Por qué se revisa igual:** que el cambio lo haya escrito una IA no lo hace automáticamente correcto. El PR es justo el mecanismo que permite decidir qué entra en `main`. Mantener el mismo proceso para personas y para Claude evita crear un camino especial sin revisión.

### Traer la rama de Claude a tu máquina

```bash
git fetch
git checkout fix/4-cambiar-color-pieza-j-azul-palido
```

Usa el nombre completo de la rama, incluido el prefijo (`fix/`, `feature/`... o `claude/` en las ramas antiguas).

> **Por qué `fetch` primero:** la rama la creó una Action en GitHub, no tú. No existe en tu copia local hasta que la descargas. (Ver el [error `pathspec`](#error-pathspec--did-not-match-any-files-known-to-git).)

### Buenas prácticas

- Escribe issues claros: Claude produce mejores resultados con criterios de aceptación explícitos.
- Revisa el diff completo antes de aprobar.
- Si quieres ajustes, comenta en el PR o haz tus propios commits sobre la rama.
- Mantén la regla de un issue, una rama, un PR.

> **Por qué issues claros:** Claude solo tiene el texto del issue y el código. Un issue ambiguo produce una interpretación ambigua. Los criterios de aceptación le dicen (igual que a una persona) cuándo está terminado.

---

## 10. Chuleta de comandos

### Ramas

```bash
git branch                    # listar locales
git branch -a                 # listar locales y remotas
git switch nombre             # cambiar de rama
git switch -c nombre          # crear y cambiar
git branch -d nombre          # borrar local (segura, exige que esté mergeada)
git branch -D nombre          # borrar local (forzada)
git push origin --delete nombre   # borrar remota
git fetch --prune             # limpiar referencias remotas
```

### Cambios

```bash
git status
git diff                      # cambios sin preparar
git diff --staged             # cambios preparados
git add archivo
git commit -m "mensaje"
git commit --amend            # modificar último commit
git restore archivo           # descartar cambios
```

### Sincronización

```bash
git fetch
git pull
git pull --rebase
git push
git push -u origin rama       # primera subida
git push --force-with-lease   # forzado seguro
```

### Historial

```bash
git log --oneline --graph --all
git log -p archivo            # historial de un archivo con cambios
git show <hash>
git blame archivo             # quién cambió cada línea
git reflog                    # red de seguridad: historial de movimientos de HEAD
```

### Deshacer

```bash
git revert <hash>
git reset --soft HEAD~1
git reset --hard HEAD~1       # destructivo
git cherry-pick <hash>
git stash push -m "msg"
git stash pop
```

### GitHub CLI

```bash
gh issue create
gh issue list
gh issue develop <n> --checkout
gh pr create
gh pr list
gh pr checkout <n>
gh pr merge --squash
gh pr status
```

---

## Resumen del ciclo

```
1. Issue          →  gh issue create
2. Actualizar     →  git switch main && git pull
3. Rama           →  git switch -c feature/N-descripcion
4. Commits        →  git add . && git commit -m "..."
5. Push           →  git push -u origin feature/N-descripcion
6. Pull Request   →  gh pr create --body "Closes #N"
7. Revisión       →  commits adicionales si hacen falta
8. Merge          →  gh pr merge
9. Limpieza       →  git switch main && git pull && git branch -d ...
```

> **Regla de oro:** si dudas antes de una operación destructiva (`reset --hard`, `push --force`, `branch -D`), revisa primero con `git status`, `git log` y `git reflog`.
