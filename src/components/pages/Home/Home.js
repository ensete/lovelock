import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import { LinkPro, ButtonPro } from '../../elements/Button';
import { callView } from '../../../helper';
import * as actions from '../../../store/actions';
import PuNewLock from '../Propose/PuNewLock';
import LandingPage from '../../layout/LandingPage';

const RightBox = styled.div`
  text-align: center;
  padding: ${rem(30)};
  img {
    width: 200px;
    height: 200px;
  }
  h1,
  h2 {
    text-align: center;
  }
  .emptyTitle {
    margin: 16px auto;
    font-size: 25px;
    line-height: 32px;
    font-weight: 60px;
  }
  .emptySubTitle {
    color: #506175;
    font-size: 18px;
    line-height: 24px;
    margin: 16px auto;
  }
`;

const ActionForm = styled.div`
  margin-top: 20px;
`;

const ShadowBox = styled.div`
  padding: ${rem(30)};
  border-radius: 10px;
  background: #f5f5f8;
  box-shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)';
`;

function Home(props) {
  const [openPromise, setOpenPromise] = useState(false);
  const { address, history, setNeedAuth, tokenKey } = props;
  const [homePropose, setHomePropose] = useState(null);

  useEffect(() => {
    loadAcceptPropose();
  }, []);

  function loadAcceptPropose() {
    if (address) {
      callView('getProposeByAddress', [address]).then(proposes => {
        setHomePropose(proposes || []);
      });
    }
  }

  useEffect(() => {
    if (homePropose && homePropose.length > 0) {
      const pro = homePropose.filter(item => item.status === 1);
      let index;
      if (pro.length > 0) {
        index = pro[0].id;
      } else {
        index = homePropose[0].id;
      }
      history.push(`/lock/${index}`);
    }
  }, [homePropose]);

  function openPopup() {
    if (!tokenKey) {
      setNeedAuth(true);
    }
    setOpenPromise(true);
  }

  function openExplore() {
    history.push('/explore');
  }

  function closePopup() {
    setOpenPromise(false);
    loadAcceptPropose();
  }

  const renderHomeEmptyPropose = (
    <FlexWidthBox>
      <ShadowBox>
        <RightBox>
          <div>
            <img src="/static/img/plant.svg" alt="plant" />
            <div className="emptyTitle">
              <h1>You have no locks yet.</h1>
            </div>
            <div className="emptySubTitle">
              <h2>Locks are the way you connect and share memories with your loved ones.</h2>
            </div>
            <ActionForm>
              <ButtonPro variant="contained" color="primary" onClick={openPopup}>
                Create first lock
              </ButtonPro>
            </ActionForm>
            <LinkPro className="btn_add_promise" onClick={openExplore}>
              or explore others&apos;
            </LinkPro>
          </div>
        </RightBox>
      </ShadowBox>
      {openPromise && tokenKey && <PuNewLock close={closePopup} />}
    </FlexWidthBox>
  );

  return address ? (
    <FlexBox wrap="wrap" justify="center">
      {homePropose && homePropose.length < 1 && renderHomeEmptyPropose}
    </FlexBox>
  ) : (
    <LandingPage />
  );
}

const mapStateToProps = state => {
  return {
    address: state.account.address,
    tokenKey: state.account.tokenKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setNeedAuth: value => {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
