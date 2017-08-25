import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import CopyToClipboard from 'react-copy-to-clipboard'
import { getStatusText } from 'http-status-codes'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css'

import logo from './assets/tom-wiggle.gif'
import './App.css'

const SERVER_URL = 'https://m27c8w7std.execute-api.us-east-1.amazonaws.com/production'
const CACHED_URL = 'http://d33mq7kft5dle8.cloudfront.net/'

class App extends Component {
  state = {
    accepted: [],
    rejected: [],
    loading: true,
    uploading: false,
    copied: false,
    preview: undefined
  }

  upload = files => {
    this.setState({
      loading: true,
      uploading: true
    })
    const file = files[0]

    let body = new FormData()
    body.append('file', file)

    fetch(`${SERVER_URL}/upload`, { method: 'POST', body })
      .then(res => {
        return new Promise((resolve, reject) => {
          if (res.status !== 200)
            return res
              .text()
              .then(err => reject(new Error(err)))
              .catch(() => reject(res))
          res
            .json()
            .then(
              data => (res.status !== 200 ? reject(res) : resolve(data.url))
            )
        })
      })
      .then(url => {
        url = new window.URL(new window.URL(url).pathname, CACHED_URL)
        this.setState({
          preview: url,
          loading: false,
          uploading: false
        })
      })
      .catch(err => {
        console.error(err)
        NotificationManager.error(
          err.message ||
            err.description ||
            err.status +
              ' ' +
              (err.statusText !== ''
                ? err.statusText
                : getStatusText(err.status)) ||
            'API Unavailable'
        )
        this.setState({
          uploading: false,
          loading: false
        })
      })
  }

  clearState = () => {
    this.setState({
      accepted: [],
      rejected: [],
      loading: false,
      copied: false,
      preview: undefined
    })
  }

  componentDidMount() {
    this.setState({ loading: false })
  }

  render() {
    const { copied, preview, loading, uploading } = this.state

    return (
      <div id="app">
        <div id="header">
          <h1>Tomify</h1>
        </div>

        <NotificationContainer />

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
              if (accepted.length > 0) this.upload(accepted)
              else
                NotificationManager.error(
                  `Filetype not supported, ${rejected[0].type}`
                )
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
