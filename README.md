# PokéSurvivor · Mundo Misterioso

## 繁體中文＋Windows 手把衍生版

此倉庫直接 fork 自 [JPTER78/pokesurvivor](https://github.com/JPTER78/pokesurvivor)，原作者為 JPTER78。免費、非商業用途；本版加入繁體中文與標準瀏覽器手把支援，保留原版自動瞄準與攻擊玩法。

### 下載與執行（Windows）

1. 開啟 [Actions → Windows download](https://github.com/Max-FullTek/pokesurvivor/actions/workflows/windows.yml)，選擇最新成功的執行記錄。
2. 在 Artifacts 下載 `PokeSurvivor-Windows-zh-Hant`（下載需登入 GitHub；保留 30 天，可用 Run workflow 重新產生）。
3. 完整解壓縮，雙擊 `index.html`，使用 Edge 或 Chrome 開啟。保留 `assets`、`css`、`js` 資料夾，無須安裝 Node.js 或 Python。
4. 首次以滑鼠點一下頁面啟用音效，連接手把並按任意按鈕。中文瀏覽器會自動使用繁中；也可在「設定 → 畫面 → 語言」選擇「繁體中文」。

| 手把（依 Xbox 按鈕位置） | 功能 |
|---|---|
| 左搖桿 | 類比移動；選單內移動選取框 |
| 十字鍵 | 遊戲中：上／右／下／左選招式 1／2／3／4；選單內：導航 |
| LB／RB | 上一個／下一個招式 |
| A／B | 選單確認／返回 |
| Start | 暫停／繼續；子選單內返回 |
| X | 升級畫面重抽選項 |

選單選取框以黃色標示；滑鼠、鍵盤與觸控仍可使用。支援瀏覽器回報 `standard` mapping 的手把，實際相容性依手把、驅動與瀏覽器而異；登入欄位仍使用鍵盤輸入。手把失去焦點或拔除時會清除輸入。

**存檔：** 本版停用原作者的 Firebase 設定，只使用目前瀏覽器的本機帳號與存檔，不能直接使用原站雲端存檔、好友、合作或排行榜。建立本機帳號可儲存進度；訪客模式不儲存。清除瀏覽器資料或更換開啟方式可能讓原存檔無法存取。

### 開發與 Actions

使用 Node.js 22、Python 3.12：`npm ci` → `npm test` → `npm run build` → `npm run package:windows`。結果在 `dist/PokeSurvivor-Windows-zh-Hant.zip`。

推送至 `main` 或 `feat/**`、建立 PR、手動 Run workflow 都會執行相同檢查與打包。Actions 只上傳下載檔，不自動部署網站或發行 Release。遊戲頁面修改 `dev.html`，再產生 `index.html`；請勿手改生成檔。

原作者上游：`git fetch upstream` 後，於工作樹乾淨時用 `git merge upstream/main` 整合更新；有衝突時檢查解決，再重新測試與建置。上游更新不會自動覆蓋本版功能。

繁中靜態翻譯資料改編自 Kai5106 的 [MIT 補丁 v1.3.3](https://greasyfork.org/zh-TW/scripts/599869)，直接整合在既有語言系統，沒有載入補丁的執行程式或自動更新機制。詳見 [CREDITS.md](CREDITS.md) 及語言檔案內授權聲明。

---

Bullet-heaven con Pokémon al estilo de Survivor.io y Megabonk, con sprites de
*Pokémon Mundo Misterioso*, capa roguelike, **966 Pokémon de las 9 generaciones**,
shinies y gacha por región. Música y efectos compuestos para el juego.

HTML + CSS + JavaScript vanilla sobre Canvas 2D. Sin build, sin dependencias y
**todo local**: no necesita internet para jugar.

> **Aviso sobre criptomonedas / Crypto disclaimer**
>
> PokéSurvivor **no tiene ninguna criptomoneda, token ni NFT oficial**, y yo no
> he creado ninguno. Cualquier token que use el nombre del juego lo han creado
> terceros. **No me hago cargo de ninguna compra, venta o inversión** que hagas
> con ellos y nada de lo que hay aquí es una recomendación de inversión. El
> juego es gratis y lo seguirá siendo.
>
> PokéSurvivor has **no official cryptocurrency, token or NFT**, and I have not
> created any. Any token using the game's name was created by third parties.
> **I take no responsibility for any purchase, sale or investment** you make
> with them, and nothing here is investment advice. The game is free and will
> stay free.

## Jugar

Doble clic en `index.html`. Crea una cuenta o entra como invitado, haz el test
de personalidad y a la mazmorra.

| Tecla | Acción |
|---|---|
| `W` `A` `S` `D` / flechas | Moverse |
| `1` `2` `3` `4` | Elegir el movimiento activo |
| `Q` / `E` | Ciclar movimientos |
| `Esc` / `P` | Pausa |

**En móvil o tablet** (en horizontal): pon el dedo en cualquier sitio y arrastra
para moverte (el joystick aparece donde tocas), toca un ataque de abajo para
cambiarlo y el botón de arriba a la derecha para pausar. Se puede instalar como
app ("Añadir a pantalla de inicio"). En **Ajustes** hay sonido, calidad gráfica
(con modo automático), números de daño, menos sacudidas, FPS y la cuenta.

El Pokémon ataca solo con el movimiento activo (o con todos los de un
**vínculo**: cada legendario vencido deja fusionar movimientos para lanzarlos a
la vez desde un solo hueco, hasta 4). Las rocas, cofres y la hierba
alta se rompen; las paredes y los árboles bloquean los disparos enemigos; el
agua frena y la lava quema (también a los enemigos).

En el mapa hay **altares de poder**, **manantiales** que curan, **cofres con
candado** (quédate a su lado unos segundos) y **trampas** que también dañan a
los enemigos. A veces se abre una **grieta**: entra y lucharás contra un
**legendario** en una arena aparte.

Hay **tabla de tipos** (un Rayo Burbuja le quita más a un Charmander) y,
de vez en cuando, **climas** (sol, lluvia, arena, nieve, niebla) que potencian
unos tipos y debilitan otros.

Cada día hay **misiones** (y semanales) que dan tickets y monedas; los
**logros** dan medallas y títulos, y tu **perfil** enseña tus 3 Pokémon
favoritos, tus marcas y tus medallas. En las runs encuentras **objetos** (Restos,
Cinta Elección...) y tus movimientos **evolucionan** al máximo nivel. Los
enemigos tienen personalidad: curan, ponen escudos, llaman a su manada o atacan
con aviso en el suelo.

Las **mejoras** son de cada Pokémon. El **gacha** va con **tickets** que se
ganan jugando (×1 de algunos Pokémon, ×10 de jefes y legendarios), y se tira
en una tragaperras pixel art.

Cada enemigo tiene 1/4096 de salir **shiny**: brilla, una flecha en el borde de
la pantalla te dice dónde está, y si lo derrotas te lo quedas. En el gacha sale
shiny 1 de cada 100 tiradas. En la colección eliges tu compañero en versión
normal o shiny.

La música suena tras el primer clic (los navegadores no dejan reproducir sonido
antes). Volumen y silencio: botón del altavoz arriba a la derecha, o en la pausa.

El guardado vive en el `localStorage` del navegador: si borras los datos del
sitio, se pierde.

En `videos/` hay grabaciones del juego (con su música): un combate contra un
jefe, la captura de un shiny salvaje y un shiny en el gacha.

## Guardado en la nube y publicación

- **Base de datos (Firebase):** cuentas con nombre + contraseña o Google, y la
  partida se sigue en cualquier ordenador. Pasos en [docs/FIREBASE.md](docs/FIREBASE.md).
  Sin configurar, el juego guarda sólo en el navegador, como antes.
- **Jugar con amigos (hasta 4) y ranking:** con cuenta en la nube, menú
  **Amigos** (añadir por apodo, invitar a tu sala) y **Ranking** (tiempo
  aguantado: solo o grupo, de hoy a histórico, amigos, por Pokémon).
- **Publicar gratis en GitHub Pages:** [docs/PUBLICAR.md](docs/PUBLICAR.md).
- Si se juega en dos ordenadores a la vez o sin conexión, las partidas se
  **fusionan**: las colecciones se unen (nunca se pierde un Pokémon ni un
  shiny), mejoras y estadísticas se quedan con el máximo, y monedas y
  compañero con la versión más reciente. Los cambios de otro ordenador llegan
  en directo.

## Licencia

Código bajo [PolyForm Noncommercial 1.0.0](LICENSE-NONCOMMERCIAL.md) desde el
14-10-2026: se puede usar, estudiar y modificar, pero **no con fines
comerciales** (ni vender el juego ni cobrar nada dentro de él). Las versiones
hasta el commit `b297089` se publicaron bajo MIT. Los sprites (CC BY-NC 4.0),
la fuente (OFL) y las marcas de Pokémon tienen sus propias condiciones: ver
[LICENSE](LICENSE) y [CREDITS.md](CREDITS.md). Proyecto de fan sin ánimo de
lucro.

**La única web oficial es [pokesurvivor.com](https://pokesurvivor.com).** El
juego es y será gratis: si alguien te pide pagar, no somos nosotros.

## Estructura

```
index.html              pantallas + orden de carga
css/style.css           interfaz estilo Mundo Misterioso
assets/pokemon/{dex}/   hojas de sprites PMD (Idle, Walk, Attack, Shoot, Charge, Hurt, Faint)
assets/pokemon/{dex}/s/ las mismas en versión shiny
assets/fonts/           Pixelify Sans (OFL) y su versión con números redibujados (tools/make_font.py)
js/
  net/      social (apodo, amigos, salas), net (WebRTC + relé),
            coop (partida en grupo), ranking
  core/     util, db (guardado), audio (sintetizador + efectos), input,
            sprites (animador PMD), camera
  data/     pokedex*, sprites-meta*, moves, starters (+ test), enemies,
            upgrades, music (partituras)
  world/    tiles (pixel art en código), world (terreno, objetos, colisiones)
  entities/ player, enemy, projectile, pickup, fx
  systems/  combat, spawner, levelup, gacha
  ui/       icons (pixel art), ui, hud, login, test, menu, gacha-ui, run-ui,
            social-ui, ranking-ui
  game.js   flujo y bucle principal
tools/      scripts que regeneran los ficheros marcados con *
```

`*` = generado. Para rehacerlos (necesita Python 3 + Pillow e internet, sólo esa vez):

```
python tools/fetch_sprites.py    # sprites normal y shiny + js/data/sprites-meta.js
                                 # (~20 min; se puede cortar y relanzar: usa tools/cache/)
python tools/fetch_pokedex.py    # js/data/pokedex.js
python tools/fetch_credits.py    # CREDITS.md
```

## Notas de implementación

- **Sprites PMD.** Columnas = fotogramas, filas = 8 direcciones (Down, DownRight,
  Right, UpRight, Up, UpLeft, Left, DownLeft — verificado con los `-Offsets.png`).
  Cada animación tiene su propio tamaño de fotograma, así que se alinean por el
  **ancla al suelo** sacada del `-Shadow.png`; sin eso el sprite saltaría al atacar.
- **Coordenadas.** `(x, y)` de una entidad son sus **pies**. Las colisiones
  ocurren en el plano del suelo; los proyectiles vuelan en ese plano y se dibujan
  elevados con su sombra debajo.
- **Mundo.** Chunks de 16×16 tiles: los *datos* (terreno, objetos) son baratos y
  se generan siempre; la *imagen* se hornea a resolución de arte escribiendo en un
  `ImageData` (~4 ms por chunk en Chrome) y sólo para los visibles.
- **Rendimiento.** Rejilla espacial de enemigos reconstruida cada frame. Con 420
  enemigos, simulación + render completo ≈ 3 ms por frame en Chrome.
- **Metadatos en `.js`, no `.json`**, porque `fetch()` está bloqueado en `file://`.
- **Shiny.** Los shiny de SpriteCollab son el mismo dibujo con otra paleta; están
  en `s/` y sólo 30 tienen geometría distinta (campo `sa` en los metadatos).
  Las hojas se guardan como PNG con paleta exacta: misma imagen, la mitad de peso.
- **Audio.** Sintetizador Web Audio con planificador anticipado (programa las
  notas 150 ms por delante) y reverb por convolución con un impulso generado.
  Las partituras están en `js/data/music.js` en un formato de texto propio.
  Los efectos tienen separación mínima entre repeticiones y un tope de voces,
  para que 400 enemigos golpeados a la vez no saturen.
- **Iconos.** Mapas de caracteres convertidos a canvas y data URLs; siempre a
  múltiplos enteros de su tamaño para que el píxel quede limpio.

## Créditos y licencia

Sprites de [SpriteCollab](https://github.com/PMDCollab/SpriteCollab) bajo
**CC BY-NC 4.0** — uso **no comercial** y con atribución; la lista de artistas
está en [`CREDITS.md`](CREDITS.md). Pokémon es propiedad de Nintendo, Creatures
Inc. y GAME FREAK. Proyecto de fan sin ánimo de lucro.
