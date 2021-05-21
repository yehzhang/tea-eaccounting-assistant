import EventContext from '../core/EventContext';
import Reader from '../core/Reader/Reader';
import useContext from '../core/Reader/useContext';
import runUpdateWithEventContext from '../core/runUpdateWithEventContext';
import Event from '../event/Event';
import updateOnDmvCryButtonPressed from './dmv/updateOnDmvCryButtonPressed';
import updateOnDmvInstallCommandIssued from './dmv/updateOnDmvInstallCommandIssued';
import updateOnTeaDispenserCommandIssued from './teaDispenser/updateOnTeaDispenserCommandIssued';
import updateOnTeaDispenserHandsUpButtonPressed
  from './teaDispenser/updateOnTeaDispenserHandsUpButtonPressed';
import updateOnTeaDispenserImagePosted from './teaDispenser/updateOnTeaDispenserImagePosted';
import updateOnTeaDispenserKiwiButtonPressed
  from './teaDispenser/updateOnTeaDispenserKiwiButtonPressed';
import updateOnWebFleetLootEditorPosted from './teaDispenser/web/updateOnWebFleetLootEditorPosted';
import updateOnWebFleetLootEditorRequested
  from './teaDispenser/web/updateOnWebFleetLootEditorRequested';
import updateOnWebIndexRequested from './teaDispenser/web/updateOnWebIndexRequested';
import updateOnWebNeederChooserRequested
  from './teaDispenser/web/updateOnWebNeederChooserRequested';
import updateOnWebNeedsEditorPosted from './teaDispenser/web/updateOnWebNeedsEditorPosted';
import updateOnWebNeedsEditorRequested from './teaDispenser/web/updateOnWebNeedsEditorRequested';
import updateOnPinged from './updateOnPinged';

function update(event: Event): Reader<EventContext, boolean> {
  return useContext(
    {
      messageIdToEditRef: { current: null },
    },
    runUpdateWithEventContext(
      {
        '[Chat] Pinged': updateOnPinged,
        '[TeaDispenser] ImagePosted': updateOnTeaDispenserImagePosted,
        '[TeaDispenser] HandsUpButtonPressed': updateOnTeaDispenserHandsUpButtonPressed,
        '[TeaDispenser] KiwiButtonPressed': updateOnTeaDispenserKiwiButtonPressed,
        '[TeaDispenser] CommandIssued': updateOnTeaDispenserCommandIssued,
        '[Dmv] InstallCommandIssued': updateOnDmvInstallCommandIssued,
        '[Dmv] CryButtonPressed': updateOnDmvCryButtonPressed,
        '[Web] IndexRequested': updateOnWebIndexRequested,
        '[Web] FleetLootEditorRequested': updateOnWebFleetLootEditorRequested,
        '[Web] FleetLootEditorPosted': updateOnWebFleetLootEditorPosted,
        '[Web] NeederChooserRequested': updateOnWebNeederChooserRequested,
        '[Web] NeedsEditorRequested': updateOnWebNeedsEditorRequested,
        '[Web] NeedsEditorPosted': updateOnWebNeedsEditorPosted,
      },
      event
    )
  );
}

export default update;
