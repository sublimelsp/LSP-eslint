#!/usr/bin/env bash
# @see https://github.com/microsoft/vscode-eslint

GITHUB_REPO_URL="https://github.com/microsoft/vscode-eslint"
GITHUB_REPO_NAME=$(echo "${GITHUB_REPO_URL}" | command grep -oE '[^/]*$')

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="${SCRIPT_DIR}"
TEMP_DIR="${REPO_DIR}/temp"
SRC_SERVER_DIR="${TEMP_DIR}/server"

# -------- #
# clean up #
# -------- #

pushd "${REPO_DIR}" || exit

rm -rf out package-lock.json package.json update-info.log
mkdir -p "${TEMP_DIR}"

popd || exit


# ---------------- #
# download sources #
# ---------------- #

pushd "${TEMP_DIR}" || exit

echo 'Enter commit SHA, branch or tag (for example 2.1.0) to build'
read -rp 'SHA, branch or tag (default: main): ' ref

if [ "${ref}" = "" ]; then
    ref="main"
fi

temp_zip="src-${ref//\//-}.zip"
download_url="${GITHUB_REPO_URL}/archive/${ref}.zip"
echo "Downloading ${download_url}"
curl -L "${download_url}" -o "${temp_zip}"
unzip -z "${temp_zip}" > update-info.log
unzip "${temp_zip}" && rm -f "${temp_zip}"
mv "${GITHUB_REPO_NAME}-"*/* "${TEMP_DIR}"

popd || exit

# ------------ #
# prepare deps #
# ------------ #

pushd "${TEMP_DIR}" || exit

echo 'Installing dependencies...'
npm install

echo 'Applying patches...'
patch -p1 < "${SCRIPT_DIR}/webpack-disable-minimize.patch" || exit

popd || exit


# ------- #
# compile #
# ------- #

pushd "${SRC_SERVER_DIR}" || exit

echo 'Compiling server...'
npm run webpack

popd || exit


# -------------------- #
# collect output files #
# -------------------- #

pushd "${SRC_SERVER_DIR}" || exit

echo 'Copying and cleaning up files...'
find ./out -name "*.map" -delete
cp -f ../update-info.log "${REPO_DIR}"
cp -r out package.json "${REPO_DIR}"
rm -rf "${TEMP_DIR}"

popd || exit
