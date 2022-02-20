from json import ( dumps, loads )
import logging
import os
import requests
from flask import jsonify

from flask import (
    Flask,
    g,
    request,
    Response
)

app = Flask(__name__, static_url_path='/static')

port = 3000

@app.route('/')
def get_index():
    return app.send_static_file('index.html')

@app.route('/discord_callback', methods=['GET'])
def discord_callback():
    endpoint = 'https://discord.com/api/v9'
    code = request.args.get['code']

    response = requests.post('%s/oauth2/token' % endpoint, data={
        'code': code,
        'client_id': '944160977925058590',
        'client_secret': 'Paj4OuiKL5cEBjqLjPJUnsBGCk--9n3X',
        'grant_type': 'authorization_code',
        'redirect_uri': 'http://localhost:3000/discord_callback'
    }, headers={ 'Content-Type': 'application/x-www-form-urlencoded' })
    
    access_token = response['access_token']

    response = requests.get('%s/users/@me' % endpoint, headers={
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Brearer: %s' % access_token
    })

    user_id = response['user_id']
    user_name = response['user_name']
    email = response['email']
    avatar = response['avatar']

    response = requests.get('/users/@me/guilds' % endpoint, headers={
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Brearer: %s' % access_token
    })
    
    guilds_count = len()

    return Response.json({ 'user_id': user_id, 'user_name': user_name, 'email': email, 'avatar': '' % avatar })

if __name__ == '__main__':
    logging.root.setLevel(logging.INFO)
    logging.info('Start server on port %d', port)
    app.run(port=port)