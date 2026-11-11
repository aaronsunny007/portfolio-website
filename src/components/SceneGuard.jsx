import { Component } from 'react';

// If a 3D layer cannot start (no context, or its code fails to load) the guard drops it and tells the page, which then shows its plain fallback.
export default class SceneGuard extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
