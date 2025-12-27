# Git推送错误：分支名不匹配导致的推送失败

## 问题描述

在使用Git推送到GitHub时遇到以下错误：

```
fatal: The current branch master has no upstream branch.
```

随后尝试推送main分支时又遇到：

```
error: src refspec main does not match any
error: failed to push some refs to 'github.com:huangguozhao/LoginDemo.git'
```

## 错误场景

1. 初始化Git仓库并添加远程仓库
2. 本地提交代码到 `master` 分支
3. 尝试推送时使用错误的命令

## 原因分析

问题的根本原因是分支名不匹配：

- **本地分支**：`master`（Git默认创建的分支名）
- **尝试推送的目标分支**：`main`（现代GitHub的默认分支名）

在Git 2.28版本之后，Git默认分支从`master`改为`main`，但用户本地仍然创建了`master`分支，而尝试推送到不存在的`main`分支。

## 解决方案

### 方法一：推送master分支（推荐）

```bash
git push -u origin master
```

这个命令会：
- 将本地 `master` 分支推送到远程 `master` 分支
- 设置上游分支，之后只需使用 `git push` 即可推送

### 方法二：重命名分支为main

如果想使用 `main` 作为默认分支：

```bash
# 重命名本地分支
git branch -m master main

# 推送main分支
git push -u origin main
```

## 验证结果

推送成功后，可以使用以下命令验证：

```bash
git status
```

应该显示：
```
On branch master
Your branch is up to date with 'origin/master'.
```

## 预防建议

1. **保持分支名一致**：在项目开始时就决定使用哪个分支名（master 或 main）
2. **使用正确的推送命令**：首次推送时使用 `-u` 参数设置上游分支
3. **检查分支状态**：使用 `git branch -a` 查看所有分支
4. **设置Git默认分支**：可以通过以下命令设置默认分支为main：

```bash
git config --global init.defaultBranch main
```

这样新创建的仓库将默认使用 `main` 分支。

## 总结

这个错误虽然常见，但很好解决。关键是要理解本地分支和远程分支的对应关系，以及Git的默认分支变化。在现代开发环境中，建议统一使用 `main` 作为默认分支名。
