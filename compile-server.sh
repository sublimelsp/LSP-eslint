#!/usr/bin/env bash
# @see https://github.com/microsoft/vscode-eslint

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="${SCRIPT_DIR}"
SRC_DIR="${REPO_DIR}/vscode-eslint"
TEMP_DIR="${SRC_DIR}/temp"
SRC_SERVER_DIR="${TEMP_DIR}/server"


# ------------------------- #
# download the source codes #
# ------------------------- #

pushd "${REPO_DIR}" || exit

rm -rf "${SRC_DIR}"

mkdir -p "${TEMP_DIR}"

popd || exit


# ------------------------- #
# download the source codes #
# ------------------------- #

pushd "${TEMP_DIR}" || exit

echo 'Enter commit SHA or tag (for example 2.1.0) to build'
read -rp 'SHA or tag: ' ref

# Strip the top-level directory so that we don't have to deal with extra level.
curl -L "https://github.com/microsoft/vscode-eslint/archive/${ref}.tar.gz" | tar -xzv --strip 1

popd || exit


# ------------ #
# prepare deps #
# ------------ #

pushd "${SRC_SERVER_DIR}" || exit

echo 'Installing dependencies...'
npm install
npm install -D typescript @types/node


# ------- #
# compile #
# ------- #

echo 'Compiling server...'
npx tsc --newLine LF -p .

popd || exit


# -------------------- #
# collect output files #
# -------------------- #

pushd "${SRC_SERVER_DIR}" || exit

echo 'Copying and cleaning up files...'
find ./out -name "*.map" -delete 
cp -r out package.json package-lock.json "${SRC_DIR}"
rm -rf "${TEMP_DIR}"

popd || exit
