import {App, Plugin, PluginSettingTab, Setting, TFile} from 'obsidian';

interface PluginSettings {
	host: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	host: 'https://example.com/'
}

export default class URILinkRedirectCopyPlugin extends Plugin {
	settings: PluginSettings;

	async copyUri(file: TFile) {
		//@ts-ignore
		const originalUri = this.app.getObsidianUrl(file);
		const uri = originalUri.replace("obsidian://", this.settings.host);
		await navigator.clipboard.writeText(uri);
	}

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'copy-url',
			name: 'Copy URL',
			checkCallback: (checking) => {
				if (checking) {
					return !!this.app.workspace.activeEditor?.file;
				}
				const file = this.app.workspace.activeEditor?.file;
				this.copyUri(file!);
			}
		});
		this.addSettingTab(new PluginSettingsTab(this.app, this));

		this.registerEvent(this.app.workspace.on('file-menu', (menu, file) => {
			if (file instanceof TFile) {
				menu.addItem(item => {
					item
						.setTitle("Copy Redirect URI")
						.setSection("info")
						.setIcon("external-link")
						.onClick(() => {
							this.copyUri(file);
						});
				});
			}
		}))
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class PluginSettingsTab extends PluginSettingTab {
	plugin: URILinkRedirectCopyPlugin;

	constructor(app: App, plugin: URILinkRedirectCopyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Host')
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.host)
				.setValue(this.plugin.settings.host)
				.onChange(async (value) => {
					this.plugin.settings.host = value;
					await this.plugin.saveSettings();
				}));
	}
}
