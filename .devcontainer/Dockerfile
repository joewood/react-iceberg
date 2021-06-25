
FROM docker.io/bitnami/spark:3.0.2 AS spark_base
USER root

# [Option] Install zsh
ARG INSTALL_ZSH="false"
# [Option] Upgrade OS packages to their latest versions
ARG UPGRADE_PACKAGES="true"
# Install needed packages and setup non-root user. Use a separate RUN statement to add your own dependencies.
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID
COPY library-scripts/*.sh library-scripts/*.env /tmp/library-scripts/
RUN bash /tmp/library-scripts/common-debian.sh "${INSTALL_ZSH}" "${USERNAME}" "${USER_UID}" "${USER_GID}" "${UPGRADE_PACKAGES}" "true" "true" 

WORKDIR /workspaces

ENV HOME=/home/${USERNAME}
# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# # Create a non-root user to use if preferred - see https://aka.ms/vscode-remote/containers/non-root-user.
# RUN groupadd --gid "$USER_GID" "$USERNAME" && \
#     useradd -s /bin/bash --uid "$USER_UID" --gid "$USER_GID" -m "$USERNAME" 

# RUN apt-get update --yes && \
#      apt-get install --yes --no-install-recommends \
#      git sudo

# RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
#      && chmod 0440 /etc/sudoers.d/$USERNAME \

RUN chmod +777 -R /opt/bitnami && \
    chmod +777 -R /workspaces

RUN echo "spark.jars.packages org.apache.iceberg:iceberg-spark3-runtime:0.11.1" >> "${SPARK_HOME}/conf/spark-defaults.conf"

ENV PYTHON=/opt/bitnami/python/bin/python
RUN python -m pip install -U ipykernel requests pyspark==3.0.2 notebook pylint

#### Install NodeJS
FROM spark_base

ENV NODE_VERSION 14.17.1
ENV ARCH=x64

RUN apt-get update --yes && \
     apt-get install --yes --no-install-recommends \
     xz-utils

RUN NODE_FILE="node-v${NODE_VERSION}-linux-${ARCH}.tar.xz" \
    && NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/${NODE_FILE}" \
    && echo $NODE_FILE \
    && curl -fsSLO --compressed $NODE_URL  \
    && ls -la /usr/local \ 
    && tar -xJf $NODE_FILE -C /usr/local --strip-components=1 --no-same-owner \
    && rm $NODE_FILE  \
    && ls -la \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs \
    && node --version \
    && npm --version

ARG NPM_GLOBAL=/usr/local/share/npm-global
ENV NVM_DIR=/usr/local/share/nvm
ENV NVM_SYMLINK_CURRENT=true \ 
    PATH=${NPM_GLOBAL}/bin:${NVM_DIR}/current/bin:${PATH}
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    # Install yarn, nvm
    && rm -rf /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg \
    && bash /tmp/library-scripts/node-debian.sh "${NVM_DIR}" "none" "${USERNAME}" \
    # Configure global npm install location, use group to adapt to UID/GID changes
    && if ! cat /etc/group | grep -e "^npm:" > /dev/null 2>&1; then groupadd -r npm; fi \
    && usermod -a -G npm ${USERNAME} \
    && umask 0002 \
    && mkdir -p ${NPM_GLOBAL} \
    && touch /usr/local/etc/npmrc \
    && chown ${USERNAME}:npm ${NPM_GLOBAL} /usr/local/etc/npmrc \
    && chmod g+s ${NPM_GLOBAL} \
    && npm config -g set prefix ${NPM_GLOBAL} \
    && sudo -u ${USERNAME} npm config -g set prefix ${NPM_GLOBAL} \
    && su ${USERNAME} -c "umask 0002 && npm install -g eslint" \
    && npm cache clean --force > /dev/null 2>&1 \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/* /root/.gnupg /tmp/library-scripts

USER ${USERNAME}

CMD ["/opt/bitnami/scripts/spark/run.sh"]


