#set shell := ["bash", "-c"]

# ------------------------------------------------------------------------------
# Variables
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# Default
# ------------------------------------------------------------------------------

# Default target: List available commands
default:
    @just --list

# ------------------------------------------------------------------------------
# Development
# ------------------------------------------------------------------------------

# Zip the contents.
[group('Development')]
[linux]
zip zipname="code-fold":
    zip -r ../{{zipname}}.zip manifest.json content.js styles.css

# Check the zip the contents.
[group('Development')]
[linux]
zipc zipname="code-fold":
    unzip -l ../{{zipname}}.zip

# Run treeclip with default flags.
[group('Development')]
[linux]
treeclip dir="":
    treeclip run {{ dir }} -f -t -v -c --stats

# ------------------------------------------------------------------------------
# Code Quality
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# Git
# ------------------------------------------------------------------------------

# Commit staged changes with amend.
[group('Git')]
amend:
    git commit -a --amend

[group('Git')]
empty:
    git commit --allow-empty

# Rebase current branch to the specified number of commits (Usage: just rebase 5)
[group('Git')]
rebase n="3":
    git rebase -i HEAD~{{ n }}

[group('Git')]
[linux]
diff-cp:
    git diff HEAD | xclip -selection clipboard

[group('Git')]
[windows]
diff-cp:
    git diff HEAD | /c/Windows/System32/clip.exe

[group('Git')]
today:
    git log --since="today 00:00:00" --until="today 23:59:59" --oneline

[group('Git')]
grf:
    git log --graph --pretty=format:'%C(auto)%h%Creset %C(cyan)%>(12,trunc)%an%Creset %Cgreen%>(12,trunc)%cr%Creset %C(auto)%d%Creset %s' --abbrev-commit --all --date=relative
