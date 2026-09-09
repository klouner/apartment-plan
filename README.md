# Выдрино · архитектурная модель v8

## v8.6 — поверхности, интерьер и мягкий свет

Исправлены wall mounts и точки в проёмах, добавлены скрытые спуски и потолочная cAP ax с PoE. Детализированы пианино, душевые, ТВ, акустика, кондиционеры, кровати, диваны, стулья, шкафы, стиральная машина и светильники. Добавлены редактируемые деревянные панели и картины. Шторы открываются кнопкой с плавным движением. Полные стены включены по умолчанию; срез доступен вручную. Данные мигрируют при загрузке старого project.json и сохранений. Новые монтажные места и отделка — предложения. Подробные границы проверки и источники: [QUALITY-v8.6.md](QUALITY-v8.6.md).

## v8.5.1 — ночной режим телефона

Телефон перенесён налево; на desktop под него выделено место без перекрытия модели. При открытии отключаются дневные источники и environment, а группы включают настоящие SpotLight в координатах светильников. При закрытии исходное освещение восстанавливается. Старые жёлтые диски на полу удалены. Состав источников стабилен при переключении групп. Тени от каждого прибора отключены ради мобильной производительности: перекрытие света стенами в 3D приблизительное; это не фотометрический/IES-расчёт. Мощность визуального света не используется для расчёта электрики. Резервный Canvas-режим показывает отдельную 2D-аппроксимацию с ограничением пятен контурами комнат. Проверка: `node verify-night.mjs`.

Продолжение Three.js-проекта v7. Предыдущая реализация сохранена в `legacy-v7.html`.

- Архитектура восстановлена по векторным координатам листа 2 файла «чертежи в работе 1.pdf».
- Начало координат: внутренняя верхняя левая грань техкомнаты. Единицы: метры; Y вверх, X вправо, Z вниз по чертежу.
- Калибровка: 47.2440944882 PDF points на метр; проверена по размеру 1785 мм и вертикали 4020 мм.
- 3580/3680 мм — разные грани уступа спальни. В модели сохранён уступ 100 мм.
- В `project.json` находятся постоянные ID, узлы, стены, параметрические проёмы, полы, предметы, инженерные точки и предложения трасс.
- 58 встраиваемых светильников и 9 зон тёплого пола извлечены из векторных обозначений.
- Мебель и блоки розеток требуют контрольной сверки; `needs_verification` не означает монтажную готовность.
- Коробки, магистрали и ответвления являются предложениями: нагрузка, сечения, аппараты защиты и пересечения должны быть проверены отдельно.
- Редактор узлов сохраняет принадлежность проёмов стене и блокирует выход проёма за границы стены. Полы и отопительные контуры после изменения стен требуют сверки.
- JSON import/export и autosave используют ID вместо случайных Three.js UUID. Старые сохранения v7 несовместимы.
- Three.js r180 и три официальных дополнения размещены локально с MIT-лицензией.

Проверка: `node verify.mjs`. Восстановление базовой модели: `python build_model.py ARCH.pdf SMART.pdf`, затем `python enrich_model.py` (пути исходников внутри последнего скрипта относятся к рабочей структуре `source-pdfs`).

Основные известные ограничения: оконные четверти упрощены; полы не пересчитываются автоматически после изменения планировки; LED и отдельные электрические выводы пока доступны только на соответствующих подложках; полнота монтажной схемы не заявляется.

## Электрика 8.2 · предварительная схема

Кнопка «Электрика» открывает маршруты и вкладку «Щит»: 12 управляемых групп света, 21 кнопочный вход, отдельные потребители, 5 зон протечки, шторы и резерв T1–T9. Выбор цепи изолирует её трассы; доступны кабельный журнал CSV и полный JSON. Силовой щит предложен на западной стене техкомнаты, Ethernet — в отдельном шкафу. Компоновка 8×24 DIN условная: клеммы и монтажные каналы требуют деталировки.

Все 21 кнопки назначены на входы того же MR6C, который управляет соответствующим светом. Это карта для настройки локальной матрицы, а не загруженная конфигурация реального оборудования. MR6C получает одну фазу от одного АВДТ на весь модуль. Внутренняя шина RS-485 последовательная; кабели кнопок и Ethernet имеют отдельную топологию звезды. MWAC требует отдельного БП и изоляции цепей датчиков согласно документации изготовителя.

**Не рабочий монтажный проект.** Предположения, источники, мощности, предварительные сечения/защиты и неизвестные параметры перечислены в `project.json → electrical`. Нормативная основа: СП 256.1325800.2016, серия ГОСТ Р 50571, ГОСТ 31565. Доступный текст СП содержит изменения 1–6; перед рабочим проектом нужно проверить последующие изменения. Соответствие всем действующим требованиям не заявляется. Нужны данные ввода, ток КЗ, способы прокладки, зоны санузлов, паспорта техники и координация с ОВ/ВК. Электрический нагрев пола не назначен без определения его типа. Группировка освещения — предложение, не полная расшифровка A-10.

Генератор: `python electrical_model.py` (пересобирает предложение электрики и перезаписывает его ручные правки). Проверки: `node verify.mjs` и `node verify-electrical.mjs`. Редактор пересчитывает длины изменённых трасс. Автосохранения v8.2 отделены от старых; прежние правки можно скачать во вкладке «Проект», они не удаляются и автоматически с новой электрикой не смешиваются.

## v8.3 — source placement review and panel inspection

## v8.5 — phone preview

The “Дом” button opens a phone-shaped, Apple Home-inspired local demo. Lighting tiles follow actual project circuit IDs; curtain sliders show opening position; a simulated leak closes water and prevents reopening until all alarms are cleared. Clearing an alarm does not reopen valves automatically. There is no HomeKit/MQTT integration or connection to physical hardware, and no dimmer control is claimed for the relay modules. Simulation state is temporary and is separate from saved design edits.

## v8.4 — interactive editing

Cable vertices can be edited with the plan gizmo or coordinates; new cables are created between existing endpoints. Manual intermediate routes are retained when endpoints move. Added an object catalog, quarter-turn controls, a persistent autosave indicator, DIN-row placement editing and relay-channel assignment. First-person movement uses WASD or a touch joystick, with wall and large-furniture collision checks.

The same `vydrino-v8.3` autosave key is retained. Migration preserves edited object positions and separates the island pendants from the dining-table group where the old unmodified group membership is recognizable. Thirteen currently modeled light groups each have one panel feeder. A-10 decorative/LED and exterior lighting are not yet a complete reconstructed circuit schedule.

New or modified electrical connections remain preliminary. New modules are initially unconnected; moving a module does not change its terminal IDs. The editor is not a substitute for electrical design verification.

- Furniture footprints corrected from the vector A-03 sheet. Source socket schedule: 57 mechanisms, including five exterior IP66 mechanisms. Exterior annotations have been projected onto the façade surface. Detailed bathroom zoning is still pending.
- Added procedural TV/audio, projector/screen, kitchen appliances and a schematic 80 L / 2 kW boiler. Proposed additions are marked `needs_verification`.
- Cable picking highlights the continuous upstream path, including the panel feeder and junction-box branch. Length is the polyline centreline length, before bends/installation allowance. Narrow routes support a screen-space picking tolerance.
- Preliminary protection schedule: 34 RCBOs (5 B6, 5 B10, 23 B16, 1 B32; 1P+N, type A, 30 mA), plus input/DC protection still to be selected. It is not a finished electrical calculation.
- `panel-detail.js` shows nine 24-DIN rails, functional terminal connections, device documentation and conductor tables. `panelWiring` in JSON is the shared connection schedule. Actual input, protective device model, supply protection class, short-circuit ratings, wire grouping, terminal/distribution capacity and valve motor pinout are deliberately unresolved.
- WB terminal semantics are checked against manufacturer documentation. The SVG terminal positions and internal 3D routing are schematic, not a drill/assembly template. The controller model has not been selected.
- Snapshot namespace is `vydrino-v8.3`. Previous edits remain available for download, and JSON import/export remains supported.

Reproduce from a v8.2 project snapshot with `python upgrade_v83.py /path/to/v8.2-project.json`, then `python panel_netlist.py`. Do not run the older electrical generator over v8.3. Verify with `node verify.mjs`, `node verify-electrical.mjs`, and `node verify-v83.mjs`.
