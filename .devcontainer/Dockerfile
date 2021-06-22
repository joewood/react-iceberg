
FROM docker.io/bitnami/spark:3.0.2
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
RUN bash /tmp/library-scripts/common-debian.sh "${INSTALL_ZSH}" "${USERNAME}" "${USER_UID}" "${USER_GID}" "${UPGRADE_PACKAGES}" "true" "true" \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/* /tmp/library-scripts

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

CMD ["/opt/bitnami/scripts/spark/run.sh"]
