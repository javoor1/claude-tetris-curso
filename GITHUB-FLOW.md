# Guía de GitHub Flow

Tutorial práctico para trabajar con issues, ramas y Pull Requests en este proyecto. Incluye el flujo diario, administración del repositorio, casos de uso comunes y solución de problemas.

## Índice

1. [Qué es GitHub Flow](#1-qué-es-github-flow)
2. [Configuración inicial](#2-configuración-inicial)
3. [El flujo paso a paso](#3-el-flujo-paso-a-paso)
4. [Convenciones](#4-convenciones)
5. [Administración del repositorio](#5-administración-del-repositorio)
6. [Casos de uso comunes](#6-casos-de-uso-comunes)
7. [Problemas frecuentes y soluciones](#7-problemas-frecuentes-y-soluciones)
8. [Trabajar con Claude Code y las GitHub Actions](#8-trabajar-con-claude-code-y-las-github-actions)
9. [Chuleta de comandos](#9-chuleta-de-comandos)

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

### Por qué este modelo

- **Git Flow** (`develop`, `release`, `hotfix`) es demasiado pesado para un proyecto sin versiones numeradas.
- **Trunk-based** (commits directos a `main`) exige tests automáticos y mucha disciplina. Este proyecto no tiene tests.

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

### Clonar el repositorio

```bash
git clone https://github.com/<usuario>/claude-tetris-curso.git
cd claude-tetris-curso
```

### Comprobar el estado

```bash
git status
git branch -a      # ramas locales y remotas
git remote -v      # remotos configurados
```

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

### Paso 2: actualizar `main` local

Antes de crear una rama, parte siempre de un `main` actualizado:

```bash
git switch main
git pull origin main
```

### Paso 3: crear la rama

Nombre con formato `tipo/numero-descripcion-corta`:

```bash
git switch -c feature/2-pausa-con-tecla-p
```

Atajo que además enlaza la rama con el issue en GitHub:

```bash
gh issue develop 2 --checkout
```

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

### Paso 5: subir la rama

La primera vez, con seguimiento (`-u`):

```bash
git push -u origin feature/2-pausa-con-tecla-p
```

Después basta con `git push`.

### Paso 6: abrir el Pull Request

```bash
gh pr create --title "Añade pausa con tecla P" --body "Closes #2"
```

Incluir `Closes #2` (o `Fixes #2`, `Resolves #2`) en la descripción **cierra el issue automáticamente** al hacer merge.

Puedes abrir el PR como borrador (*draft*) si el trabajo aún no está listo:

```bash
gh pr create --draft
```

### Paso 7: revisión

- El revisor comenta, pide cambios o aprueba.
- Para responder a comentarios, haz nuevos commits en la misma rama y súbelos. El PR se actualiza solo.
- Resuelve las conversaciones una vez atendidas.

### Paso 8: merge

Desde la web (botón *Merge*) o con la CLI:

```bash
gh pr merge --merge     # merge commit
gh pr merge --squash    # un solo commit
gh pr merge --rebase    # historia lineal
```

Ver [tipos de merge](#tipos-de-merge-y-cuál-elegir).

### Paso 9: limpiar

```bash
git switch main
git pull origin main
git branch -d feature/2-pausa-con-tecla-p      # borra la local
git push origin --delete feature/2-pausa-con-tecla-p   # borra la remota (si no se borró sola)
git fetch --prune                               # limpia referencias remotas obsoletas
```

---

## 4. Convenciones

### Nombres de ramas

| Prefijo     | Uso                          | Ejemplo                          |
|-------------|------------------------------|----------------------------------|
| `feature/`  | Funcionalidad nueva          | `feature/2-pausa-con-tecla-p`    |
| `fix/`      | Corrección de un bug         | `fix/5-colision-en-borde`        |
| `docs/`     | Documentación                | `docs/7-actualizar-readme`       |
| `refactor/` | Reestructurar sin cambiar comportamiento | `refactor/9-separar-render` |
| `chore/`    | Mantenimiento, configuración | `chore/11-actualizar-workflow`   |

Reglas: minúsculas, guiones en lugar de espacios, número de issue al inicio, descripción corta.

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

### Descripción de un PR

Debe responder:

- Qué cambia y por qué.
- Cómo probarlo.
- Qué issue cierra (`Closes #N`).

### Tipos de merge y cuál elegir

| Tipo                  | Resultado en `main`                        | Cuándo usarlo                                   |
|-----------------------|--------------------------------------------|-------------------------------------------------|
| **Merge commit**      | Conserva todos los commits + un commit de merge | Quieres preservar el historial completo de la rama |
| **Squash and merge**  | Un solo commit con todos los cambios       | La rama tiene muchos commits ruidosos ("wip", "arreglo") |
| **Rebase and merge**  | Commits reaplicados linealmente, sin commit de merge | Quieres historia lineal conservando commits |

> **Atención con squash:** los commits originales de la rama ya no aparecen en `main`. Siguen visibles en el PR cerrado, pero no en `git log` de `main`. Si necesitas poder volver a commits individuales, usa merge commit o rebase.

---

## 5. Administración del repositorio

Esta sección cubre la configuración que mantiene `main` sano.

### Proteger `main`

*Settings → Branches → Add branch ruleset* (o *Branch protection rule*) sobre `main`:

- **Require a pull request before merging**: nadie hace push directo a `main`.
- **Require approvals**: mínimo de aprobaciones (1 es razonable).
- **Require status checks to pass**: exige que pasen los workflows de CI.
- **Require conversation resolution**: no se mergea con comentarios abiertos.
- **Block force pushes** y **Restrict deletions**: protege el historial.

### Borrado automático de ramas

*Settings → General → Pull Requests → Automatically delete head branches*. Activarlo evita acumular ramas ya mergeadas.

### Tipo de merge permitido

En *Settings → General → Pull Requests* puedes habilitar solo los tipos de merge que quieras usar, y elegir el predeterminado. Fija una política y mantenla.

### Etiquetas y organización de issues

- Usa etiquetas (`bug`, `enhancement`, `docs`, `good first issue`).
- Usa *Milestones* para agrupar issues por objetivo.
- Usa *Projects* (tablero Kanban) si quieres seguimiento visual.

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

### Etiquetas de versión (tags)

Para marcar versiones estables:

```bash
git tag -a v1.0.0 -m "Primera versión estable"
git push origin v1.0.0
```

Los tags permiten volver a una versión concreta aunque la rama se haya borrado.

### Mantenimiento periódico

```bash
git fetch --prune                  # elimina referencias a ramas remotas borradas
git branch --merged main           # ramas locales ya mergeadas (candidatas a borrar)
git branch -vv                     # ramas locales y su seguimiento remoto
```

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

### 6.3 Corregir el último commit

Cambiar el mensaje o añadir un archivo olvidado (solo si **no** lo has subido aún):

```bash
git add archivo-olvidado.js
git commit --amend
```

Si ya lo subiste a una rama personal: `git push --force-with-lease`.

### 6.4 Deshacer cambios

| Situación                                         | Comando                              |
|---------------------------------------------------|--------------------------------------|
| Descartar cambios sin confirmar de un archivo     | `git restore archivo`                |
| Sacar un archivo del *staging*                    | `git restore --staged archivo`       |
| Deshacer el último commit conservando los cambios | `git reset --soft HEAD~1`            |
| Deshacer el último commit y descartar cambios     | `git reset --hard HEAD~1` (destructivo) |
| Deshacer un commit **ya publicado**               | `git revert <hash>` (crea commit inverso) |

Regla: en commits ya compartidos usa `revert`, no `reset`.

### 6.5 Volver a un commit antiguo

```bash
git log --oneline              # localizar el hash
git switch -c rescate <hash>   # crear rama desde ese punto
```

Para solo mirar sin crear rama: `git checkout <hash>` (queda en *detached HEAD*; vuelve con `git switch main`).

### 6.6 Traer un solo commit de otra rama

```bash
git cherry-pick <hash>
```

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

### 6.8 Trabajar con varios issues a la vez

Cada issue tiene su propia rama, siempre desde `main`:

```bash
git switch main && git pull
git switch -c fix/5-colision-en-borde
```

No encadenes ramas (una rama sobre otra) salvo que dependas realmente del otro cambio. Si dependes, indícalo en la descripción del PR y mergea primero el anterior.

### 6.9 Contribuir a un repositorio ajeno (fork)

```bash
gh repo fork <dueño>/<repo> --clone
cd <repo>
git remote add upstream https://github.com/<dueño>/<repo>.git
git fetch upstream
git switch -c feature/mi-cambio upstream/main
```

Luego abre el PR desde tu fork hacia el repositorio original.

### 6.10 Cerrar un issue sin código

Cierra manualmente con un comentario explicativo o con:

```bash
gh issue close 3 --comment "Duplicado de #2"
```

### 6.11 Revisar el PR de otra persona en local

```bash
gh pr checkout 12
```

### 6.12 Hotfix urgente

El flujo es el mismo, solo con prioridad:

```bash
git switch main && git pull
git switch -c fix/15-crash-al-iniciar
# arreglar, commit, push
gh pr create --title "Arregla crash al iniciar" --body "Closes #15"
```

No hace falta una rama especial: GitHub Flow trata todo cambio igual.

---

## 7. Problemas frecuentes y soluciones

### `error: pathspec '...' did not match any file(s) known to git`

Causa: el nombre de la rama es incorrecto (falta un prefijo) o no la tienes localmente.

```bash
git fetch
git branch -a                       # ver el nombre completo
git checkout claude/issue-2-20261006-1735   # usa el nombre COMPLETO con prefijo
```

### `fatal: A branch named '...' already exists`

La rama ya existe. Cámbiate a ella con `git switch nombre` o elige otro nombre.

### `error: failed to push some refs ... (non-fast-forward)`

Causa: la rama remota tiene commits que no tienes.

```bash
git pull --rebase origin <rama>
git push
```

### `Your local changes would be overwritten by checkout/merge`

Tienes cambios sin confirmar que chocarían. Opciones:

```bash
git stash push -m "temporal"    # guardarlos
# hacer el cambio de rama o merge
git stash pop                   # recuperarlos
```

o bien confirma los cambios con un commit.

### Estoy en *detached HEAD*

Estás en un commit suelto, no en una rama. Si no hiciste cambios: `git switch main`. Si hiciste commits que quieres conservar:

```bash
git switch -c nombre-nueva-rama
```

### Hice commits en `main` por error

Antes de hacer push:

```bash
git branch feature/mi-cambio      # la nueva rama apunta a tus commits
git reset --hard origin/main      # main vuelve al estado remoto (destructivo en main local)
git switch feature/mi-cambio
```

Verifica con `git log` antes del `reset --hard`.

### Push directo a `main` rechazado

Es la protección de rama funcionando. Mueve tus commits a una rama (ver caso anterior) y abre un PR.

### El PR tiene conflictos

Actualiza tu rama con `main` (ver [6.1](#61-mantener-mi-rama-al-día-con-main)), resuelve los conflictos (ver [6.7](#67-resolver-conflictos-de-merge)) y haz push. El PR se actualiza solo.

### Borré una rama sin mergear

Los commits siguen en el repositorio un tiempo:

```bash
git reflog                        # buscar el hash del último commit de esa rama
git switch -c recuperada <hash>
```

Git los elimina definitivamente con la recolección de basura, normalmente tras varias semanas.

### Confirmé un secreto (contraseña, token, clave API)

1. **Revoca y rota el secreto de inmediato.** Es el paso más importante: asume que está comprometido.
2. Quitarlo del historial es secundario. Si el commit ya se subió, otros pudieron haberlo copiado.
3. Para limpiar el historial se usa `git filter-repo` o BFG Repo-Cleaner, y requiere force push; coordina con el equipo.

### Subí un archivo grande o innecesario

Añádelo a `.gitignore` y deja de rastrearlo:

```bash
echo "archivo-o-carpeta" >> .gitignore
git rm --cached archivo
git commit -m "chore: deja de rastrear archivo"
```

### Mi rama local y la remota divergieron

```bash
git fetch
git status                         # indica cuántos commits difieren
git pull --rebase origin <rama>    # integra los cambios remotos
```

### Hice `git push --force` y rompí la rama de otra persona

Prevención: usa siempre `--force-with-lease` en lugar de `--force`, y nunca en `main`. Para recuperar, quien tenga el estado anterior puede volver a subirlo, o se puede restaurar desde `git reflog` si la tenías en local.

### Los finales de línea cambian en todo el archivo (Windows)

```bash
git config --global core.autocrlf true
```

Considera añadir un archivo `.gitattributes` con `* text=auto` al repositorio.

### Ramas remotas que ya no existen aparecen en `git branch -a`

```bash
git fetch --prune
```

---

## 8. Trabajar con Claude Code y las GitHub Actions

Este repositorio tiene dos workflows de Claude Code en `.github/workflows/`: uno de asistente de PR y otro de revisión de código.

### Cómo encaja en el flujo

- Mencionar `@claude` en un issue o en un comentario de PR puede disparar al asistente, que trabaja en una rama propia.
- Esas ramas llevan un nombre generado, por ejemplo `claude/issue-2-20261006-1735`.
- El resultado llega como un PR normal: **revísalo igual que el de cualquier persona** antes de mergear.

### Traer la rama de Claude a tu máquina

```bash
git fetch
git checkout claude/issue-2-20261006-1735
```

Usa el nombre completo, incluido el prefijo `claude/`.

### Buenas prácticas

- Escribe issues claros: Claude produce mejores resultados con criterios de aceptación explícitos.
- Revisa el diff completo antes de aprobar.
- Si quieres ajustes, comenta en el PR o haz tus propios commits sobre la rama.
- Mantén la regla de un issue, una rama, un PR.

---

## 9. Chuleta de comandos

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
