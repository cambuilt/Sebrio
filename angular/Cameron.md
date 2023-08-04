# Commands to run PuTTY
chmod 400 RMP-Stage.pem && ssh -i RMP-Stage.pem ec2-user@18.221.247.244
su root
m45t3rk3Y4dmin@#$%^

# Pull latest master and start the app
# cd /opt/nginx/html/angular && pm2 kill && git pull && nvm install 10.4.1 && pm2 start start.sh --watch && pm2 monit 
# Use ng build --prod to deploy. pm2 and ng serve were both trying to use 4200.   && nvm install 10.4.1
cd /opt/nginx/html/emylabcollect.com/angular && pm2 kill && git pull && node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --prod && pm2 start ecosystem.config.js --env production

# Server editor
nano

# pm2
view logs nginx
nano /opt/nginx/logs/error.log
pm2 start start.sh --watch
pm2 monit
check port:      netstat -tunlp
Kill port      sudo kill -9 THEPIDYOUWANTTOKILL

camerontest
fxyllw5t4j

# Start or stop database server (Also go to bookmark "Production Restart")
ccontrol stop RMPStage
ccontrol start RMPStage

# Start or stop nginx
cd /opt/nginx/sbin && ./nginx -s stop
./nginx 


# Commands to kill a process and free port 4200
ps -ax | grep ng 
<OR> 
netstat -tunlp
<THEN>
sudo kill -9 21549

# PuTTY
puttygen "RMP-Stage.ppk" -O private-openssh -o privatekey.pem

# RMP Server Command
ng serve --prod --host 0.0.0.0 --public-host stage.emylabcollect.com --port 4200 --ssl --ssl-key /etc/pki/tls/private/wildcard_rhodesportal_com.key --ssl-cert /etc/pki/tls/certs/wildcard_rhodesportal_com.crt

git config -l

