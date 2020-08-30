import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import * as moment from 'moment';
import {
  Typography,
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@material-ui/core';
import { colors } from '../../theme'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Loader from '../loader'

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_COVER,
  COVER_RETURNED,
  CLAIM,
  CLAIM_RETURNED
} from '../../constants'

import Store from "../../stores";
const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

const styles = theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '1200px',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  investedContainerLoggedOut: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
    marginTop: '40px',
    [theme.breakpoints.up('md')]: {
      minWidth: '900px',
    }
  },
  investedContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: '100%',
    marginTop: '40px',
    [theme.breakpoints.up('md')]: {
      minWidth: '900px',
    }
  },
  introCenter: {
    maxWidth: '500px',
    textAlign: 'center',
    display: 'flex',
    padding: '24px 0px'
  },
  card: {
    border: '1px solid '+colors.borderBlue,
    borderRadius: '50px',
    display: 'flex',
    background: colors.white,
    width: '100%',
    padding: '42px 30px',
  },
  grey: {
    color: colors.darkGray
  },
  title: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px'
  },
  coverCard: {
    maxWidth: 'calc(100vw - 24px)',
    width: '100%',
    border: '1px solid '+colors.borderBlue,
    background: colors.white,
    borderRadius: '50px',
    padding: '30px',
  },
  assetSummary: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    [theme.breakpoints.up('sm')]: {
      flexWrap: 'nowrap'
    }
  },
  assetIcon: {
    display: 'flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    borderRadius: '20px',
    height: '30px',
    width: '30px',
    textAlign: 'center',
    marginRight: '20px',
    [theme.breakpoints.up('sm')]: {
      height: '40px',
      width: '40px',
      marginRight: '24px',
    }
  },
  headingName: {
    display: 'flex',
    alignItems: 'center',
    width: '325px',
    flex: 1,
    [theme.breakpoints.down('sm')]: {
      width: 'auto',
      flex: 1
    }
  },
  heading: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'block',
      width: '180px'
    }
  },
  action: {
    width: '100px'
  }
});

class Dashboard extends Component {

  constructor(props) {
    super()

    const account = store.getStore('account')
    const cover = store.getStore('cover')

    this.state = {
      account: account,
      cover: cover
    }

    if(account && account.address) {
      dispatcher.dispatch({ type: GET_COVER, content: {} })
    }
  }
  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(COVER_RETURNED, this.coverReturned);
    emitter.on(CLAIM_RETURNED, this.claimReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.removeListener(COVER_RETURNED, this.coverReturned);
    emitter.removeListener(CLAIM_RETURNED, this.claimReturned);
  };

  coverReturned = () => {
    this.setState({ cover: store.getStore('cover') })
  }

  claimReturned = () => {
    //who knows
    this.stopLoading()
  }

  connectionConnected = () => {
    this.setState({ account: store.getStore('account') })

    dispatcher.dispatch({ type: GET_COVER, content: {} })
  };

  connectionDisconnected = () => {
    this.setState({ account: null })
  }

  errorReturned = (error) => {
    this.setState({ loading: false })
  };

  render() {
    const { classes } = this.props;
    const {
      loading,
      account,
    } = this.state

    if(!account || !account.address) {
      return (
        <div className={ classes.root }>
          <div className={ classes.investedContainerLoggedOut }>
            <div className={ classes.introCenter }>
              <Typography variant='h3'>Connect your wallet to continue</Typography>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={ classes.root }>
        <div className={ classes.investedContainer }>
          <div className={ classes.title }>
            <Typography variant='h3' className={ classes.grey }>Your cover</Typography>
            <Button
              variant='contained'
              color="primary"
              onClick={ () => { this.nav('add') } }>
              <Typography variant={'h4'}>Add Cover</Typography>
            </Button>
          </div>
          { this.renderCover() }
        </div>
        { loading && <Loader /> }
      </div>
    )
  };

  renderCover = () => {
    const { expanded, cover } = this.state
    const { classes } = this.props
    const width = window.innerWidth

    if(!cover || cover.length === 0) {
      return (
        <Typography variant={'h4'}>You don't have any cover yet</Typography>
      )
    }


    return cover.map((contract) => {
      let logo = 'ETH-logo.png'
      if(contract.coverCurrencyDisplay.includes('ETH')) {
        logo = 'ETH-logo.png'
      } else if(contract.coverCurrencyDisplay.includes('DAI')) {
        logo = 'DAI-logo.png'
      }

      var address = null;
      if (contract.address) {
        address = contract.address.substring(0,10)+'...'+contract.address.substring(contract.address.length-8,contract.address.length)
      }

      return (
        <div className={ classes.coverCard } key={ contract.coverId } >
          <div className={ classes.assetSummary }>
            <div className={classes.headingName}>
              <div className={ classes.assetIcon }>
                <img
                  alt=""
                  src={ require('../../assets/'+contract.logo) }
                  height={ width > 600 ? '40px' : '30px'}
                />
              </div>
              <div>
                <Typography variant={ 'h3' } noWrap>{ address }</Typography>
                <Typography variant={ 'h5' } className={ classes.grey }>{ contract.name }</Typography>
              </div>
            </div>
            <div className={classes.heading}>
              <Typography variant={ 'h5' } className={ classes.grey }>Cover Purchased</Typography>
              <Typography variant={ 'h3' } noWrap>{ contract.coverAmount } { contract.coverCurrencyDisplay }</Typography>
            </div>
            <div className={classes.heading}>
              <Typography variant={ 'h5' } className={ classes.grey }>Cover Expires</Typography>
              <Typography variant={ 'h3' } noWrap>{ moment.unix(contract.expirationTimestamp).format('YYYY-MM-DD') }</Typography>
            </div>
            { contract.coverStatus.coverStatus !== '0' &&
              <div className={classes.action}>
                <Typography variant={ 'h5' } className={ classes.grey }>Claim Status</Typography>
                <Typography variant={ 'h3' } noWrap>{ contract.coverStatus.payoutCompleted ? 'Paid' : 'Pending' }</Typography>
              </div>
            }
            { contract.coverStatus.coverStatus === '0' &&
              <div className={classes.action}>
                <Button
                  variant='outlined'
                  color="primary"
                  onClick={ () => { this.onClaim(contract.coverId) } }>
                  <Typography variant={'h4'}>Claim</Typography>
                </Button>
              </div>
            }
          </div>
        </div>
      )
    })
  }

  nav = (screen) => {
    this.props.history.push('/'+screen)
  }

  startLoading = () => {
    this.setState({ loading: true })
  }

  handleChange = (id) => {
    this.setState({ expanded: this.state.expanded === id ? null : id })
  }

  onClaim = (contractId) => {
    this.startLoading()
    dispatcher.dispatch({ type: CLAIM, content: { contractId: contractId } })
  }

}

export default withRouter(withStyles(styles)(Dashboard));