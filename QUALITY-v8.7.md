# v8.7 — furniture surfaces and projector alignment

Original procedural geometry replaces 31 furniture/appliance models. Superellipsoid upholstery, cushion piping, deformed duvet, curved chair shells, turned tables, fluted island, ceramic sanitaryware, detailed projector lens/case and 16:9 screen. Piano has 52 white and 36 black keys. TV artwork and shared 256 px fabric/wood surface maps are generated deterministically in code; no licensed external assets or generation API are required.

All existing object IDs, positions, dimensions, scale, mounting and project JSON remain supported. Projector rotation follows the existing screen by default. Its inspector can disable auto-aim; projectionAutoAim is part of exported/autosaved JSON. The off-centre lens is used for aiming. A separate ceiling support stays vertical despite the case tilt. Moving the screen triggers re-aiming on rebuild. Furniture coordinates are not reset.

AI-generation options researched: Fal Hunyuan3D text/image-to-3D can supply GLB; no connected generation service was available, so none was invoked and these assets are not described as AI-generated GLBs. Poly Haven is another source for CC0 models, but model downloads were not available in this session. Future imported models must be dimension-checked, licensed and optimized before replacing project assets.

Verification: verify-premium.mjs checks actual lens direction after screen movement/rotation, disabled auto-aim, retained positions, ceiling mount endpoint, shared textures, finite vertices/normals and total triangle budget (77,416 for 31 replacements). Existing geometry, electrical, night-lighting and curtain tests remain applicable.

Physical limitation: aiming at the screen centre does not certify full-image coverage or optical feasibility. The inspector reports throw distance, approximate throw ratio and off-axis angle. Select a real projector and verify its lens shift, throw range and installation clearance. No photometric or manufacturer-specific optical simulation is claimed.

Cloud browser has no WebGL support; DOM/fallback checks do not certify GPU appearance or iPhone frame rate.
