import React, { useState } from 'react';
import LazyLoad from 'react-lazyload';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { getPalette } from '../../../helper/palette';
import Skeleton from '@material-ui/lab/Skeleton';

export default function BlogShowcase(props) {
  const [colors, setColors] = useState(props.colors || {});
  const { classes, firstImg, firstLine, openHandler } = props;
  const ratio = firstImg && firstImg.aspect_ratio && firstImg.aspect_ratio.ratio;
  const height = ratio ? Math.floor(5.95 * ratio) : 160; // current image with on timeline is 595
  const frameStyle = colors.frameBackColor ? { backgroundColor: colors.frameBackColor } : {};
  if (!firstImg) {
    frameStyle.paddingBottom = 0;
  }
  const labelStyle = colors.labelBackColor ? { backgroundColor: colors.labelBackColor } : {};
  if (!firstLine) {
    return  <Skeleton variant="rect" width='100%' height={164} />
  }
  return (
    <span className={classes.blogImgWrp} style={frameStyle} onClick={openHandler}>
      <span className={classes.blogTitleImg} style={labelStyle}>
        BLOG
      </span>
      <LazyLoad height={height} offset={12} once>
        <TransitionGroup>
          <CSSTransition classNames="timeline-blog" timeout={1100} appear>
            <img
              src={firstImg ? firstImg.url : '/static/img/landing.svg'}
              className={classes.blogImgTimeline}
              style={firstImg ? {} : { maxHeight: height, objectFit: 'cover' }}
              onLoad={() => {
                if (!firstImg) {
                  setColors({frameBackColor: '#8250c8', labelBackColor: '#8250c8'})
                } else {
                  getPalette(firstImg.url).then(colors => colors && setColors(colors));
                }
              }}
            />
          </CSSTransition>
        </TransitionGroup>
      </LazyLoad>
      <span 
        className={classes.blogFirstLine}
        style={firstImg ? {} : { 
          position: 'absolute',
          left: 0,
          right: 0,
          top: '40%',
          transform: 'translateY(-50%)'
         }}>{firstLine}</span>
    </span>
  );
}
