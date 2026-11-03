# dmgbuild settings for TankiAlert.dmg (used by scripts/make-dmg.sh).
# dmgbuild writes the Finder layout (.DS_Store) itself, so it doesn't depend on scripting Finder, which
# ignores icon-view changes made over AppleScript on macOS 26.
# Paths are relative to app/. Pass -D app=... -D volicon=... to override.
# ruff: noqa: F821  (`defines` is injected by dmgbuild)

app = defines.get("app", "build/TankiAlert.app")
volicon = defines.get("volicon", "Sources/Resources/AppIcon.icns")

files = [app]
symlinks = {"Applications": "/Applications"}
hide_extension = ["TankiAlert.app"]
icon = volicon

format = defines.get("format", "ULMO")  # LZMA, the smallest; macOS 10.15+ (the app needs 13+)
filesystem = "HFS+"

# background@2x.png next to it is picked up automatically for Retina.
background = "dmg/background.png"

# The frame includes the title bar. macOS 26 Finder always shows its toolbar and status bar (97 pt of chrome),
# which leaves exactly the 660x400 design visible; older Finders hide them and show a bit more dark footer.
# The icons sit on the ends of the arrow drawn in background.svg.
window_rect = ((200, 140), (660, 497))
default_view = "icon-view"
show_status_bar = False
show_tab_view = False
show_toolbar = False
show_pathbar = False
show_sidebar = False
arrange_by = None
icon_size = 100
text_size = 13
icon_locations = {
    "TankiAlert.app": (170, 215),
    "Applications": (490, 215),
}
