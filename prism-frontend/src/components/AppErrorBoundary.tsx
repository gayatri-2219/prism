import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'Unexpected runtime error',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary] Runtime crash:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-3">App failed to render</h1>
          <p className="text-slate-600 mb-4">
            A runtime error occurred. The app is now protected from showing a blank page.
          </p>
          <pre className="text-sm bg-slate-100 border border-slate-200 rounded-lg p-3 overflow-x-auto mb-6">
            {this.state.message}
          </pre>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}
