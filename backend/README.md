### Building and deploying docker
1. docker build -t healthdocker .
2. docker tag IMAGEID us-east4-docker.pkg.dev/healthhack-416016/healthhackrepo/healthimage
3. docker push us-east4-docker.pkg.dev/healthhack-416016/healthhackrepo/healthimage
4. gcloud run deploy --image=us-east4-docker.pkg.dev/healthhack-416016/healthhackrepo/healthimage --platform=managed