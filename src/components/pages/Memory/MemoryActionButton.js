import React, { useState, useEffect } from 'react';
import { useSelector, connect } from 'react-redux';
import { CardActions, Button, Typography } from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { withStyles, makeStyles } from '@material-ui/core/styles';

import * as actions from '../../../store/actions';
import { sendTransaction } from '../../../helper';

const useStyles = makeStyles(theme => ({
  button: {
    color: 'rgba(0, 0, 0, 0.54)',
    // minWidth: theme.spacing(12),
    width: '100%',
  },
  rightIcon: {
    marginRight: theme.spacing(1),
  },
  liked: {
    marginRight: theme.spacing(1),
  },
  margin: {
    margin: theme.spacing(1),
  },
  card: {
    // maxWidth: 345,
    marginBottom: theme.spacing(3),
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.15)',
    // boxShadow: 'none',
    // border: '1px solid rgba(234, 236, 239, 0.7)',
  },
  media: {
    height: 350,
    position: 'relative',
    overflow: 'hidden',
    // maxHeight: 350,
    // minHeight: 150,
  },
  progress: {
    margin: theme.spacing(1),
  },
  acctionsBt: {
    justifyContent: 'space-between',
  },
}));
const StyledCardActions = withStyles(theme => ({
  root: {
    padding: theme.spacing(0.4, 2),
    borderTop: '1px solid #e1e1e1',
  },
}))(CardActions);

function MemoryActionButton(props) {
  const {
    memoryType,
    memoryLikes,
    memoryIndex,
    handerShowComment,
    numComment,
    setLikeTopInfo,
    setNeedAuth,
    numLike, // Lock-level number of likes
    isMyLike, // Lock-level isMyLike
  } = props;

  const isAuto = memoryType === 1;

  const address = useSelector(state => state.account.address);
  const tokenAddress = useSelector(state => state.account.tokenAddress);
  const tokenKey = useSelector(state => state.account.tokenKey);

  const [memoryNumLike, setMemoryNumLike] = useState(0);
  const [memoryIsMyLike, setMemoryIsMyLike] = useState(false);

  const realLikeData = isAuto
    ? {
        numLike,
        isMyLike,
      }
    : {
        numLike: memoryNumLike,
        isMyLike: memoryIsMyLike,
      };

  const setLikeData = (numLike, isMyLike) => {
    if (isAuto) {
      // dispatch to global state to sync with lock-level like data
      setLikeTopInfo({ numLike, isMyLike });
    } else {
      setMemoryNumLike(numLike);
      setMemoryIsMyLike(isMyLike);
    }
  };

  useEffect(() => {
    if (isAuto) {
      return;
    }

    const num = Object.keys(memoryLikes).length;
    setMemoryIsMyLike(!!memoryLikes[address]);
    setMemoryNumLike(num);
  }, [memoryType, memoryLikes, address, isAuto]);

  function sendTxWithAuthen(...args) {
    if (tokenKey) {
      return sendTransaction(...args)
    }

    return new Promise((resolve, reject) => {
      const sendTx = () => {
        return sendTransaction(...args).then(resolve).catch(reject)
      }
      setNeedAuth(sendTx);
    })
  }

  async function handleLike() {
    const params = [memoryIndex, 1];
    await sendTxWithAuthen('addLike', params, { tokenAddress, address, sendType: 'sendAsync' })

    const newNumLike = realLikeData.isMyLike ? realLikeData.numLike - 1 : realLikeData.numLike + 1;
    const newIsMyLike = !realLikeData.isMyLike;
    setLikeData(newNumLike, newIsMyLike);
  }

  const classes = useStyles();
  return (
    <StyledCardActions className={classes.acctionsBt}>
      <Button className={classes.button} onClick={handleLike}>
        {realLikeData.isMyLike ? (
          <React.Fragment>
            <FavoriteIcon fontSize="small" color="primary" className={classes.rightIcon} />
            <Typography component="span" variant="body2" color="primary">
              {realLikeData.numLike ? ` ${realLikeData.numLike}` : ''}
            </Typography>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <FavoriteBorderIcon fontSize="small" className={classes.rightIcon} />
            <Typography component="span" variant="body2">
              {realLikeData.numLike ? ` ${realLikeData.numLike}` : ''}
            </Typography>
          </React.Fragment>
        )}
      </Button>

      <Button className={classes.button} onClick={handerShowComment}>
        <CommentIcon fontSize="small" className={classes.rightIcon} />
        <Typography component="span" variant="body2">
          {numComment}
        </Typography>
        {/* {numComment > 0 && (numComment === 1 ? `${numComment} Comment` : `${numComment} Comments`)}
        {numComment === 0 && '0 Comment'} */}
      </Button>
      {/* <Button className={classes.button}>
        <ShareIcon fontSize="small" className={classes.rightIcon} />
        Share
      </Button> */}
    </StyledCardActions>
  );
}

const mapStateToProps = state => {
  const top = state.loveinfo.topInfo;
  return {
    numLike: top.numLike,
    isMyLike: top.isMyLike,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLikeTopInfo: value => {
      dispatch(actions.setLikeTopInfo(value));
    },
    setNeedAuth(value) {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MemoryActionButton);
