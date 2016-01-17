FROM ubuntu:14.04

# Set the locale
RUN locale-gen fr_FR.UTF-8
ENV LANG fr_FR.UTF-8
ENV LANGUAGE fr_FR:fr
ENV LC_ALL fr_FR.UTF-8

# Fix timezone
RUN echo Europe/Paris > /etc/timezone && dpkg-reconfigure --frontend noninteractive tzdata

# Create user with a fixed uid corresponding to our host user
RUN groupadd -g 1000 nico && useradd -g nico -u 1000 -d /home/nico -m -s /bin/bash nico

# Install dependencies
RUN apt-get -qy update && \
    apt-get -qy --force-yes dist-upgrade && \
    DEBIAN_FRONTEND=noninteractive apt-get install -qy --force-yes \
	    git-core \
	    curl \
	    build-essential \
	    libmagick++-dev

USER nico
WORKDIR /home/nico

# Install Node
ENV NODE_VERSION 4.2.4
RUN cd /home/nico && \
  mkdir node && \
  cd node && \
  curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" && \
  tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" --strip-components=1 && \
  rm "node-v$NODE_VERSION-linux-x64.tar.gz"

ENV PATH /home/nico/node/bin:$PATH

# Update NPM
RUN npm install -g npm

EXPOSE 4000
