# garage-admin

## Installation
```bash
sudo docker build -t=nas/garage .
sudo docker run --rm \
  -v /home/nico/dev/projects/garage-admin:/home/nico/garage/admin \
  -v /home/nico/dev/projects/garage:/home/nico/garage/front \
  nas/garage \
  /bin/sh -c 'cd /home/nico/garage/front && npm install && cd /home/nico/garage/admin && npm install'
```

## Run
```bash
sudo docker run --rm \
  -v /home/nico/dev/projects/garage-admin:/home/nico/garage/admin \
  -v /home/nico/dev/projects/garage:/home/nico/garage/front \
  -p 4000:4000 nas/garage \
  node /home/nico/garage/admin/src/index.js --port 4000 --frontendFolder /home/nico/garage/front
```
