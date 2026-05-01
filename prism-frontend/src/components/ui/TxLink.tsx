import { ExternalLink } from 'lucide-react';
import { txUrl } from '../../utils/scan';

type Props = {
  hash: string;
  network?: 'testnet' | 'mainnet';
};

export default function TxLink({ hash }: Props) {
  return (
    <a href={txUrl(hash)} target="_blank" rel="noopener noreferrer" className="tx-link group">
      {hash.slice(0, 6)}...{hash.slice(-4)}
      <ExternalLink size={10} className="group-hover-shift" />
    </a>
  );
}
