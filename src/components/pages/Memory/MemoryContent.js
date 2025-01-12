import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, CardContent, IconButton, Typography } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Tooltip from '@material-ui/core/Tooltip';
import LockIcon from '@material-ui/icons/Lock';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useSnackbar } from 'notistack';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import FavoriteIcon from '@material-ui/icons/Favorite';
import WavesIcon from '@material-ui/icons/Waves';
import { Helmet } from 'react-helmet';

import * as actions from '../../../store/actions';
import {
  TimeWithFormat,
  decodeWithPublicKey,
  saveMemCacheAPI,
  loadMemCacheAPI,
  decodeImg,
  getJsonFromIpfs,
  makeProposeName,
  signalPrerenderDone
} from '../../../helper';
import { AvatarPro } from '../../elements';
import MemoryActionButton from './MemoryActionButton';
import Editor from './Editor';
import BlogModal from '../../elements/BlogModal';
import MemoryComments from './MemoryComments';
import MemoryTitle from './MemoryTitle';
import BlogShowcase from './BlogShowcase';

const useStylesFacebook = makeStyles({
  root: {
    position: 'relative',
  },
  top: {
    color: '#eef3fd',
  },
  bottom: {
    color: '#6798e5',
    animationDuration: '550ms',
    position: 'absolute',
    left: 0,
  },
});

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: 500,
    height: 450,
  },
  button: {
    color: 'rgba(0, 0, 0, 0.54)',
    width: '100%',
  },
  rightIcon: {
    marginRight: theme.spacing(1),
  },
  margin: {
    margin: theme.spacing(1),
  },
  icon: {
    fontSize: 18,
    verticalAlign: 'middle',
  },
  blogTitle: {
    color: '#707070',
    marginBottom: 16,
    display: 'block',
  },
  blogImgWrp: {
    position: 'relative',
    display: 'block',
    backgroundColor: '#333',
    paddingBottom: 16,
    cursor: 'pointer',
    margin: '-16px -16px -12px',
    transition: 'background-color 1000ms linear',
    '&:hover $blogTitleImg, &:hover $blogFirstLine': {
      color: '#fff',
    },
  },
  blogTitleImg: {
    position: 'absolute',
    backgroundColor: '#666',
    transition: 'background-color 1000ms linear',
    top: 12,
    left: 12,
    padding: '3px 10px',
    color: '#f5f5f5',
  },
  blogImgTimeline: {
    width: '100%',
  },
  blogFirstLine: {
    display: 'block',
    textAlign: 'center',
    marginTop: 16,
    color: '#f5f5f5',
    fontSize: 16,
    textTransform: 'uppercase',
    paddingLeft: 28,
    paddingRight: 28,
  },
  relationship: {
    // color: theme.color.primary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 2,
  },
  relationshipName: {
    textTransform: 'capitalize',
    color: '#8250c8',
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
    justifyContent: 'space-around',
  },
  editorComment: {
    clear: 'both',
    maxWidth: 740,
    width: '100%',
    margin: '0 auto',
  },
}));

function MemoryContent(props) {
  const { memory, setNeedAuth, propose } = props;
  const privateKey = useSelector(state => state.account.privateKey);
  const publicKey = useSelector(state => state.account.publicKey);
  const address = useSelector(state => state.account.address);
  const rName = useSelector(state => state.account.r_name);
  const sName = useSelector(state => state.account.s_name);
  // const propose = useSelector(state => state.loveinfo.propose);

  const [memoryDecrypted, setMemoryDecrypted] = useState(memory);
  // const [memoryContent, setMemoryContent] = useState('');
  const [decoding, setDecoding] = useState(false);
  const [showComment, setShowComment] = useState(true);
  const [numComment, setNumComment] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [isOpenModal, setOpenModal] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    let cancel = false
    const abort = new AbortController()

    serialMemory(abort.signal).then(mem => {
      if (cancel || !mem) return

      setMemoryDecrypted(mem)

      if (memory.showDetail && memory.info.blog) {
        setOpenModal(true);
      }
    });

    return () => {
      abort.abort()
      cancel = true
    }
  }, []);

  async function serialMemory(signal) {
    let mem = memory;
    if (memory.info.blog) {
      const blogData = JSON.parse(memory.content);
      mem = { ... memory }
      mem.meta = blogData.meta;
      mem.blogContent = await fetch(process.env.REACT_APP_IPFS + blogData.blogHash, { signal })
        .then(d => d.json())
        .catch(err => {
          if (err.name === 'AbortError') return
          throw err
        })
    } else if (memory.isPrivate) {
      const memCache = await loadMemCacheAPI(memory.id);
      if (memCache) {
        mem = memCache;
        for (let i = 0; i < mem.info.hash.length; i++) {
          const newBuffer = Buffer.from(mem.info.buffer[i]);
          // mem.info.hash[i] = await getJsonFromIpfs(newBuffer, i);
          const blob = new Blob([newBuffer], { type: 'image/jpeg' });
          mem.info.hash[i].src = URL.createObjectURL(blob);
        }
      }
    }
    
    return mem
  }

  function FacebookProgress(propsFb) {
    const classesFb = useStylesFacebook();

    return (
      <div className={classesFb.root}>
        <CircularProgress
          variant="determinate"
          value={100}
          className={classesFb.top}
          size={24}
          thickness={4}
          {...propsFb}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          className={classes.bottom}
          size={24}
          thickness={4}
          {...propsFb}
        />
      </div>
    );
  }

  function decodePrivateMemory() {
    setTimeout(() => {
      const obj = Object.assign({}, memoryDecrypted);
      if (!obj.isUnlock && privateKey && publicKey && obj.pubkey) {
        setDecoding(true);
        setTimeout(async () => {
          try {
            // loadMemCacheAPI(obj.id);
            let partnerKey = obj.pubkey;
            if (address === obj.sender) {
              partnerKey = publicKey;
            }
            obj.content = await decodeWithPublicKey(JSON.parse(obj.content || '{}'), privateKey, partnerKey);
            for (let i = 0; i < obj.info.hash.length; i++) {
              // eslint-disable-next-line no-await-in-loop
              const decodeBufferData = await decodeImg(obj.info.hash[i], privateKey, partnerKey);
              // eslint-disable-next-line no-await-in-loop
              obj.info.hash[i] = await getJsonFromIpfs(decodeBufferData, i);
              if (!obj.info.buffer) obj.info.buffer = [];
              obj.info.buffer[i] = decodeBufferData;
            }
            obj.isUnlock = true;
            setMemoryDecrypted(obj);
            saveMemCacheAPI(obj, obj.id);
          } catch (error) {
            console.error(error);
            // const message = JSON.stringify(error);
            const message = 'Unlock error, you can not view detail';
            enqueueSnackbar(message, { variant: 'error' });
            setDecoding(false);
          }
        }, 100);
      } else {
        const message = `An error occurred, please try again later`;
        enqueueSnackbar(message, { variant: 'error' });
      }
    }, 100);
  }

  function handerNumberComment(number) {
    setNumComment(number);
  }

  const textInput = useRef('');
  function handerShowComment() {
    setShowComment(true);
    setTimeout(() => {
      if (textInput.current) {
        textInput.current.focus();
      }
    }, 100);
  }

  function openMemory(memoryId) {
    setOpenModal(true);
    window.history.pushState({}, '', `?memory=${memoryId}`);
  }

  function closeMemory() {
    setOpenModal(false);
    window.history.pushState({}, '', window.location.pathname);
  }

  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const openLightbox = useCallback((event, { index }) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);
  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  function unlockMemory() {
    if (privateKey) {
      decodePrivateMemory();
    } else {
      setNeedAuth(true);
    }
  }

  const renderContentLocked = () => {
    return (
      <React.Fragment>
        {decoding ? (
          <span>
            <FacebookProgress /> Unlock...
          </span>
        ) : (
          <Tooltip title="Click to view item">
            <IconButton aria-label="settings" onClick={unlockMemory}>
              <LockIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
      </React.Fragment>
    );
  };

  const renderLockEventMemory = () => {
    return (
      <Typography variant="body2" className={classes.relationship} style={{ whiteSpace: 'pre-line' }} component="div">
        <div>
          <FavoriteIcon color="primary" fontSize="large" />
        </div>
        <span>
          <span>Locked with </span>
          {memoryDecrypted.r_name ? <Typography component="span" className={classes.relationshipName}>
            {memoryDecrypted.r_name}
          </Typography> : <span>a crush</span>}
        </span>
      </Typography>
    );
  };

  const renderJournalCreationMemory = () => {
    return (
      <Typography variant="body2" className={classes.relationship} style={{ whiteSpace: 'pre-line' }} component="div">
        <div>
          <WavesIcon color="primary" fontSize="large" />
        </div>
        <span>
          <Typography component="span" className={classes.relationshipName}>
            {memoryDecrypted.name}
          </Typography>
          <span> started the journal.</span>
        </span>
      </Typography>
    );
  };

  const renderHelmet = blogInfo => {
    signalPrerenderDone()

    const title = `${blogInfo.title} - A story on Lovelock`
    const desc = makeProposeName(propose)
    let img = blogInfo.coverPhoto && blogInfo.coverPhoto.url
    if (!img) {
      img = propose.coverImg ? 
        process.env.REACT_APP_IPFS + propose.coverImg :
        process.env.PUBLIC_URL + '/static/img/share.jpg'
    }
    return (
        <Helmet>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <meta property="og:type" content="article" />
          <meta name="description" content={desc} />
          <meta
            property="og:image"
            content={img}
          />
          <meta property="og:description" content={desc} />
        </Helmet>
      )
  }

  const renderContentUnlock = () => {
    const isBlog = !!memoryDecrypted.info.blog;
    const blogInfo = memoryDecrypted.meta || {};
    const isJournal = memoryDecrypted.sender === memoryDecrypted.receiver;
    return (
      <React.Fragment>
        {memoryDecrypted.type === 1 ? (
          isJournal ? (
            renderJournalCreationMemory()
          ) : (
            renderLockEventMemory()
          )
        ) : (
          <Typography variant="body2" style={{ whiteSpace: 'pre-line' }} component="div">
            {!isBlog && memoryDecrypted.content}
            {isBlog && blogInfo.title && (
              <BlogShowcase
                classes={classes}
                title={blogInfo.title}
                photo={blogInfo.coverPhoto}
                openHandler={() => openMemory(memory.id)}
              />
            )}
          </Typography>
        )}
        {isOpenModal && blogInfo && blogInfo.title && renderHelmet(blogInfo)}
        {isBlog && (
          <BlogModal
            open={isOpenModal}
            handleClose={closeMemory}
            title={<MemoryTitle sender={sName} receiver={rName} handleClose={closeMemory} />}
            subtitle={<TimeWithFormat value={memoryDecrypted.info.date} format="DD MMM YYYY" />}
          >
            <Editor initContent={memoryDecrypted.blogContent} read_only />
            <div className={classes.editorComment}>
              {memoryDecrypted.isUnlock && (
                <MemoryActionButton
                  handerShowComment={handerShowComment}
                  memoryLikes={memory.likes}
                  memoryIndex={memory.id}
                  memoryType={memory.type}
                  numComment={numComment}
                />
              )}
              {showComment && (
                <MemoryComments
                  handerNumberComment={handerNumberComment}
                  memoryIndex={memory.id}
                  memory={memory}
                  textInput={textInput}
                />
              )}
            </div>
          </BlogModal>
        )}
      </React.Fragment>
    );
  };
  const renderImgUnlock = () => {
    return (
      <div style={{ maxHeight: '1500px', overflow: 'hidden' }}>
        {memoryDecrypted.info.hash && (
          <Gallery
            // targetRowHeight={300}
            // containerWidth={600}
            photos={memoryDecrypted.info.hash.slice(0, 5)}
            onClick={openLightbox}
          />
        )}
      </div>
    );
  };

  const renderActionBt = () => (
    <MemoryActionButton
      handerShowComment={handerShowComment}
      memoryLikes={memory.likes}
      memoryIndex={memory.id}
      memoryType={memory.type}
      numComment={numComment}
    />
  );

  const renderComments = () => (
    <MemoryComments
      handerNumberComment={handerNumberComment}
      memoryIndex={memory.id}
      memory={memory}
      textInput={textInput}
    />
  );

  const { isUnlock } = memoryDecrypted;
  return (
    <React.Fragment>
      <Card key={memoryDecrypted.index} className={classes.card}>
        <CardHeader
          avatar={<AvatarPro alt="img" hash={memoryDecrypted.avatar} />}
          title={memoryDecrypted.name}
          subheader={<TimeWithFormat value={memoryDecrypted.info.date} format="h:mm a DD MMM YYYY" />}
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
        />
        <CardContent>{isUnlock ? renderContentUnlock() : renderContentLocked()}</CardContent>
        {isUnlock && renderImgUnlock()}
        {isUnlock && renderActionBt()}
        {showComment && renderComments()}
      </Card>
      <ModalGateway>
        {viewerIsOpen ? (
          <Modal onClose={closeLightbox} style={{ zIndex: 3 }}>
            <Carousel
              currentIndex={currentImage}
              views={memoryDecrypted.info.hash.map(x => ({
                ...x,
                srcset: x.srcSet,
                caption: x.title,
              }))}
            />
          </Modal>
        ) : null}
      </ModalGateway>
    </React.Fragment>
  );
}
// const mapStateToProps = state => {
//   return {
//     privateKey: state.account.privateKey,
//   };
// };

const mapDispatchToProps = dispatch => {
  return {
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
    setNeedAuth(value) {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  null,
  mapDispatchToProps
)(MemoryContent);
