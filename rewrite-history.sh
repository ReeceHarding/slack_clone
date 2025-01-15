git filter-branch --env-filter '
export GIT_AUTHOR_NAME="Reece Harding"
export GIT_AUTHOR_EMAIL="reeceharding@gmail.com"
export GIT_COMMITTER_NAME="Reece Harding"
export GIT_COMMITTER_EMAIL="reeceharding@gmail.com"
' -- --all 