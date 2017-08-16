import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import CopyToClipboard from 'react-copy-to-clipboard'

import logo from './assets/tom-wiggle.gif'
import './App.css'

const URL = 'https://m27c8w7std.execute-api.us-east-1.amazonaws.com/production'
const cachedURL = 'http://d33mq7kft5dle8.cloudfront.net/'

class App extends Component {
  state = {
    accepted: [],
    rejected: [],
    loading: true,
    uploading: false,
    copied: false,

    preview: undefined,
    statusMessage: undefined,
    statusType: undefined
  }

  upload = files => {
    this.setState({
      loading: true,
      uploading: true,
      statusType: undefined,
      statusMessage: undefined
    })
    const file = files[0]

    let body = new FormData()
    body.append('file', file)

    fetch(`${URL}/upload`, { method: 'POST', body })
      .then(res => {
        return new Promise((resolve, reject) => {
          res.json().then(data => {
            if (res.status !== 200) reject({ message: data })

            resolve(data.url)
          })
        })
      })
      .then(url => {
        url = new URL(new URL(url).pathname, cachedURL)
        this.setState({
          preview: url,
          loading: false,
          uploading: false,
          statusType: undefined,
          statusMessage: undefined
        })
      })
      .catch(err => {
        console.log(err)
        if (err.message) {
          this.setState({
            uploading: false,
            loading: false,
            statusType: 'error',
            statusMessage: err.message
          })
        } else {
          this.setState({
            uploading: false,
            loading: false,
            statusType: 'error',
            statusMessage: JSON.stringify(err)
          })
        }
      })
  }

  clearState = () => {
    this.setState({
      accepted: [],
      rejected: [],
      loading: false,
      copied: false,
      preview: undefined,
      statusMessage: undefined,
      statusType: undefined
    })
  }

  componentDidMount() {
    this.setState({ loading: false })
  }

  render() {
    const {
      copied,
      preview,
      loading,
      uploading,
      statusMessage,
      statusType
    } = this.state

    return (
      <div id="app">
        <div id="header">
          <h1>Tomify</h1>
        </div>

        {statusMessage &&
          statusType &&
          <div id="status" className={statusType}>
            <h1>
              {statusMessage}
            </h1>
          </div>}

        {loading &&
          <div id="loading">
            {uploading && <h2>Processing your image now!</h2>}
            <img src={logo} alt="tom wiggle" />
          </div>}

        {preview &&
          <div id="preview">
            <h2 className={copied && 'copied'}>
              Click the image below to copy a shareable link!
            </h2>
            <CopyToClipboard
              text={preview}
              onCopy={() => this.setState({ copied: true })}
            >
              <img src={preview} alt={preview} />
            </CopyToClipboard>
            <a className="button" onClick={this.clearState}>
              Click me or refresh to start over!
            </a>
          </div>}

        {!preview &&
          !loading &&
          <Dropzone
            className="dropzone"
            accept="image/jpeg, image/png"
            onDrop={(accepted, rejected) => {
              if (accepted) this.upload(accepted)
              this.setState({ accepted, rejected })
            }}
          >
            <p>Drop an image or click to select a file to upload.</p>
          </Dropzone>}
      </div>
    )
  }
}

export default App
