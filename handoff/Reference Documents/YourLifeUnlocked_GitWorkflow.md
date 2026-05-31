# YOUR LIFE / UNLOCKED
## Git Workflow — Quick Reference
*Add to project. Read at the start of any session that involves pushing code.*

---

## The Golden Rule

**Always be on main before you do anything.**

Check before every commit:

```
git status
```

The first line should say `On branch main`. If it says anything else — especially `HEAD detached` — stop and fix it before touching anything.

---

## The Standard End-of-Session Push

This is the sequence. Every time. In this order.

```
git checkout main
git add .
git commit -m "Session XX — brief description of what changed"
git pull --rebase origin main
git push
```

---

## If You See "HEAD detached"

This means you're not on any branch. Commits made here float and can be lost.

Get back to main first:

```
git checkout main
```

If git warns you that you're leaving commits behind and gives you a hash (e.g. `bbc48b8`) — grab it before it's gone:

```
git checkout main
git cherry-pick bbc48b8
```

Then continue with the standard push sequence.

---

## If You See a Merge Conflict

Git couldn't decide which version of a file to keep. It will tell you which file.

1. Open the file in VS Code
2. Search for `<<<<<<<` — that's where the conflict is
3. You'll see this pattern:

```
<<<<<<< HEAD
... version from GitHub ...
=======
... your local version ...
>>>>>>> abc1234
```

4. Pick the version you want, delete the other one and all three marker lines
5. Save the file
6. Then:

```
git add js/filename.js
git merge --continue
git push
```

**Which version to keep:** usually the one that has the actual fix you made. If both look right (like two valid ways to escape an apostrophe), keep whichever is cleaner. They're equivalent.

---

## If You See "rebase-merge directory" Error

A previous rebase got stuck. Clear it:

```
git rebase --abort
git pull --rebase origin main
git push
```

---

## If Everything Is Tangled and the Working Files Are Safe on GitHub

Nuclear option — only if you know GitHub has the right files:

```
git rebase --abort
git fetch origin
git reset --hard origin/main
```

**Warning:** this throws away all local uncommitted changes. Only use it if your working files are already pushed to GitHub or backed up elsewhere.

---

## What Caused the Session 17 Git Mess — Lessons Learned

1. A commit was made while in detached HEAD state — not on any branch
2. Cherry-pick tried to apply that floating commit but hit a conflict in `onboarding.js`
3. Multiple rebase attempts stacked on top of each other without resolving the conflict first
4. Resolution: fixed the conflict directly in VS Code, completed the merge, pushed

**The single thing that prevents all of this:** run `git status` before committing and make sure you're on main.

---

## Quick Diagnostic Commands

```
git status          — where am I, what's changed
git log --oneline   — recent commits in order
git branch          — which branch am I on
git remote -v       — confirm remote is pointing at the right GitHub repo
```

---

*Your Life / Unlocked | Git Workflow Reference | Add to project*
