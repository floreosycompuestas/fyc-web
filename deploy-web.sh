sudo docker build -f web.Dockerfile -t fyc-web-prod:latest .

sudo docker tag fyc-web-prod rgrullon/fyc-web-prod:latest

sudo docker push rgrullon/fyc-web-prod:latest

##kubectl delete -f deployment-web.yaml

##kubectl apply -f deployment-web.yaml

