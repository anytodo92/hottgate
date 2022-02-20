#!/bin/bash
LAMBDA=0n3-lambda1 

echo "------------- viewing lambda $LAMBDA"
export AWS_REGION=eu-central-1
awslogs get /aws/lambda/$LAMBDA --watch --start='5min ago' | awk '{ $1=""; $2=""; print}'
# | cut -c 3-