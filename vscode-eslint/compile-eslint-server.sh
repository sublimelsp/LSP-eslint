#!/usr/bin/env bash
# @see https://github.com/microsoft/vscode-eslint

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="${SCRIPT_DIR}"
SRC_DIR="${REPO_DIR}/src"
SRC_SERVER_DIR="${SRC_DIR}/server"
DIST_DIR="${REPO_DIR}/out"


# ------------------------- #
# download the source codes #
# ------------------------- #

pushd "${REPO_DIR}" || exit

rm -rf \
    "${SRC_DIR}" "${DIST_DIR}" \
    "package.json" "package-lock.json"

echo 'Enter commit SHA or tag (for example 2.1.0) to build'
read -rp 'SHA or tag: ' ref

curl -L "https://github.com/microsoft/vscode-eslint/archive/${ref}.tar.gz" | tar -xzv
mv vscode-eslint-* "${SRC_DIR}"

popd || exit

# ------------ #
# prepare deps #
# ------------ #

pushd "${SRC_SERVER_DIR}" || exit

npm install
npm install -D typescript @types/node

# ------- #
# compile #
# ------- #

npx tsc --newLine LF -p .

popd || exit

# -------------------- #
# collect output files #
# -------------------- #

pushd "${REPO_DIR}" || exit

mv "${SRC_SERVER_DIR}/out" "${DIST_DIR}"
cp "${SRC_SERVER_DIR}/package.json" .
cp "${SRC_SERVER_DIR}/package-lock.json" .

popd || exit
