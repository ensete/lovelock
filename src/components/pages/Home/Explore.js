import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import LeftContainer from '../Propose/Detail/LeftContainer';
import MemoryContainer from '../Memory/MemoryContainer';
import * as actions from '../../../store/actions';

import APIService from '../../../service/apiService';

const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

function Explore(props) {
  const { address, setProposes, setMemory } = props;
  const [loading, setLoading] = useState(true);
  // const [users, isLoading, error, retry] = useAPI('getLocksForFeed', [address]);
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    APIService.getLocksForFeed(address).then(resp => {
      // set to redux
      setProposes(resp.locks);

      const memoIndex = resp.locks.reduce((tmp, lock) => {
        return lock.isMyLocks ? tmp.concat(lock.memoIndex) : tmp;
      }, []);
      // console.log('memoIndex', memoIndex);
      memoIndex.lenght > 0 &&
        APIService.getMemoriesByListMemIndex(memoIndex).then(mems => {
          // set to redux
          setMemory(mems);
        });
      setLoading(false);
    });
  }

  return (
    address && (
      <FlexBox wrap="wrap">
        <FlexWidthBox width="30%">
          <LeftContainer loading={loading} />
        </FlexWidthBox>
        <FlexWidthBox width="70%">
          <RightBox>
            <MemoryContainer memorydata={[]} />
          </RightBox>
        </FlexWidthBox>
      </FlexBox>
    )
  );
}

const mapStateToProps = state => {
  return {
    address: state.account.address,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    setProposes: value => {
      dispatch(actions.setPropose(value));
    },
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Explore);
