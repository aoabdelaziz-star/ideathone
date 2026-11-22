import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import i18n from '@/i18n';
import { Button } from '@/components/ui/button';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('VMS dashboard error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="vms-card w-full max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 size-10 text-destructive" aria-hidden="true" />
          <h1 className="text-xl font-bold">{i18n.t('errors.boundaryTitle')}</h1>
          <p className="vms-muted mt-2 text-sm">{i18n.t('errors.boundaryBody')}</p>
          <Button className="mt-6" onClick={() => this.setState({ error: null })}>
            {i18n.t('errors.retry')}
          </Button>
        </div>
      </div>
    );
  }
}
