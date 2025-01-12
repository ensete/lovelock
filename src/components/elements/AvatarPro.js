import React from 'react';
import Avatar from '@material-ui/core/Avatar';

function AvatarPro({ hash, ...rest }) {
  return (
    <React.Fragment>
      {hash ? (
        <Avatar {...rest} src={process.env.REACT_APP_IPFS + hash} />
      ) : (
        <Avatar {...rest} src={rest.src || '/static/img/no-avatar.jpg'} />
      )}
    </React.Fragment>
  );
}

export { AvatarPro };
export default AvatarPro;
